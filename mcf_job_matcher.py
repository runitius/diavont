#!/usr/bin/env python3
"""
MyCareersFuture (MCF) Singapore job matcher.

Pulls live job listings from the public MCF search API, scores each job
against a resume, and writes a sorted CSV report.

Usage:
    python mcf_job_matcher.py [--resume PATH] [--terms "term1,term2,..."] [--max-per-term N]

If --resume / --terms are omitted, the script will prompt for them
interactively (press Enter to accept the shown default).

Dependencies: requests (pip install requests). Everything else is stdlib.
"""

import argparse
import csv
import html
import re
import sys
import time
from collections import Counter
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Optional

import requests

# --------------------------------------------------------------------------
# CONFIG — edit these defaults freely
# --------------------------------------------------------------------------

API_BASE = "https://api.mycareersfuture.gov.sg/v2"
SEARCH_URL = f"{API_BASE}/search"

DEFAULT_SEARCH_TERMS = [
    "solutions engineer",
    "pre-sales",
    "presales",
    "solution architect",
    "sales engineer",
    "MySQL",
    "Oracle Cloud",
    "GraphQL",
    "database administrator",
    "cloud architect",
]

DEFAULT_MAX_PER_TERM = 100   # API page size cap is 100; this caps total pulled per term
PAGE_SIZE = 100              # MCF API limit max
REQUEST_DELAY_SECONDS = 0.6  # politeness delay between requests
REQUEST_TIMEOUT = 20

DEFAULT_RESUME_PATH = "resume.pdf"

# My resume keyword profile (used as a fallback / supplement if resume
# parsing yields a thin keyword set, and to seed seniority/role matching).
RESUME_PROFILE = {
    "core_technical": [
        "Oracle Cloud Infrastructure", "OCI", "MySQL HeatWave", "MySQL Enterprise Edition",
        "GraphQL", "SQL", "Python", "Java", "R", "Oracle Analytics Cloud",
        "Oracle Machine Learning", "High Availability", "InnoDB Cluster",
        "database performance tuning", "security hardening", "Snowflake",
        "Generative AI",
    ],
    "domain": [
        "Pre-sales", "solutions engineering", "solution architecture", "C-level advisory",
        "enterprise data APIs", "API-first architecture", "digital transformation",
        "cloud migration", "technical enablement", "customer demos", "PoC", "proof of concept",
        "hospitality tech", "OPERA Cloud",
    ],
    "certifications": [
        "OCI Foundations", "OCI Architect", "OCI Multicloud Associate",
        "OCI AI Foundations Associate", "MySQL HeatWave Implementation Associate",
        "MySQL 8.0 DBA",
    ],
    "target_titles": [
        "pre-sales", "presales", "solutions engineer", "solution architect",
        "sales engineer", "technical consultant",
    ],
    "years_experience": 5,        # adjust to taste; used for seniority matching
    "target_levels": ["senior executive", "manager", "professional", "non-executive"],
}

# --------------------------------------------------------------------------
# Resume text extraction
# --------------------------------------------------------------------------


def extract_text_from_pdf(path: Path) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader  # type: ignore
        except ImportError:
            print(
                "No PDF library found (pypdf / PyPDF2). Install with:\n"
                "  pip install pypdf\n"
                "Falling back to treating the file as plain text (likely garbage for a real PDF).",
                file=sys.stderr,
            )
            return path.read_text(errors="ignore")

    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def load_resume_text(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f"Resume file not found: {path}")
    if path.suffix.lower() == ".pdf":
        return extract_text_from_pdf(path)
    return path.read_text(errors="ignore")


def extract_resume_keywords(resume_text: str) -> set:
    """Pull a lowercase keyword set out of free-text resume content."""
    text = resume_text.lower()
    keywords = set()

    # Seed with the known profile (always included, regardless of how well
    # the raw text parses — these are the terms we actually care about).
    for bucket in ("core_technical", "domain", "certifications", "target_titles"):
        for term in RESUME_PROFILE[bucket]:
            keywords.add(term.lower())

    # Also pull standalone tokens (3+ chars, alnum) that look like
    # tech/domain terms from the resume text itself, to catch anything
    # not already in the seed list.
    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9+#./-]{2,}", text)
    common_stopwords = {
        "the", "and", "for", "with", "this", "that", "from", "your", "have",
        "are", "was", "were", "will", "you", "our", "their", "they", "but",
        "not", "all", "can", "has", "had", "who", "what", "when", "how",
    }
    for tok in tokens:
        if tok in common_stopwords or len(tok) < 3:
            continue
        keywords.add(tok)

    return keywords


# --------------------------------------------------------------------------
# HTML stripping
# --------------------------------------------------------------------------


class _TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.chunks = []

    def handle_data(self, data):
        self.chunks.append(data)


def strip_html(raw: Optional[str]) -> str:
    if not raw:
        return ""
    parser = _TextExtractor()
    parser.feed(raw)
    text = " ".join(parser.chunks)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


# --------------------------------------------------------------------------
# MCF API client
# --------------------------------------------------------------------------


def search_jobs(term: str, max_results: int, session: requests.Session) -> list:
    """Paginate /v2/search for a single term, up to max_results jobs."""
    results = []
    page = 0
    while len(results) < max_results:
        body = {
            "searchQuery": term,
            "categories": [],
            "employmentTypes": [],
            "positionLevels": [],
        }
        params = {"limit": min(PAGE_SIZE, max_results - len(results)), "page": page}
        try:
            resp = session.post(SEARCH_URL, json=body, params=params, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
        except requests.RequestException as exc:
            print(f"  [warn] search failed for '{term}' page {page}: {exc}", file=sys.stderr)
            break

        data = resp.json()
        page_results = data.get("results", [])
        if not page_results:
            break

        results.extend(page_results)

        total = data.get("total", len(results))
        page += 1
        if len(results) >= total:
            break

        time.sleep(REQUEST_DELAY_SECONDS)

    return results[:max_results]


# --------------------------------------------------------------------------
# Scoring
# --------------------------------------------------------------------------

SENIORITY_LEVEL_ORDER = [
    "non-executive",
    "fresh/entry level",
    "junior executive",
    "executive",
    "senior executive",
    "manager",
    "senior manager",
    "professional",
    "middle management",
    "senior management",
]


@dataclass
class JobScore:
    job: dict
    total: int = 0
    breakdown: dict = field(default_factory=dict)
    reason: str = ""


def keyword_overlap_score(resume_keywords: set, job_skills: list, job_text: str) -> tuple:
    """Returns (score_0_to_60, matched_key_skills, matched_other)."""
    job_text_lower = job_text.lower()
    matched_key, matched_other = [], []

    for s in job_skills:
        skill_name = (s.get("skill") or "").strip()
        if not skill_name:
            continue
        skill_lower = skill_name.lower()
        hit = any(
            skill_lower == kw or skill_lower in kw or kw in skill_lower
            for kw in resume_keywords
        )
        if hit:
            if s.get("isKeySkill"):
                matched_key.append(skill_name)
            else:
                matched_other.append(skill_name)

    # Also credit resume keywords found directly in the description text,
    # even if MCF didn't tag them as a structured "skill".
    desc_hits = [kw for kw in resume_keywords if len(kw) > 3 and kw in job_text_lower]

    total_skills = len(job_skills) or 1
    key_ratio = len(matched_key) / total_skills
    other_ratio = len(matched_other) / total_skills
    desc_ratio = min(len(desc_hits) / 15, 1.0)  # cap contribution

    # Key skills weighted 2x non-key skills; description overlap is a smaller signal.
    raw = key_ratio * 2 + other_ratio + desc_ratio
    score = min(raw / 3 * 60, 60)  # normalize, cap at 60 of 100
    return round(score), matched_key, matched_other


def seniority_score(job: dict, years_experience: int, target_levels: list) -> tuple:
    """Returns (score_0_to_20, explanation)."""
    min_years = job.get("minimumYearsExperience")
    levels = [lvl.get("position", "").lower() for lvl in job.get("positionLevels", []) if isinstance(lvl, dict)]
    if not levels:
        levels = [str(l).lower() for l in job.get("positionLevels", [])]

    score = 0
    notes = []

    if min_years is not None:
        diff = years_experience - min_years
        if -1 <= diff <= 3:
            score += 12
            notes.append(f"years req {min_years} fits your {years_experience}y")
        elif diff > 3:
            score += 7
            notes.append(f"overqualified vs {min_years}y req")
        else:
            score += 3
            notes.append(f"under min {min_years}y req")
    else:
        score += 6
        notes.append("no years requirement listed")

    target_lower = {t.lower() for t in target_levels}
    if any(lvl in target_lower for lvl in levels):
        score += 8
        notes.append(f"level match: {', '.join(levels) or 'n/a'}")
    elif levels:
        score += 2
        notes.append(f"level mismatch: {', '.join(levels)}")
    else:
        score += 4
        notes.append("no level listed")

    return min(score, 20), "; ".join(notes)


def role_relevance_score(job: dict, target_titles: list) -> tuple:
    """Returns (score_0_to_20, explanation)."""
    title = (job.get("title") or "").lower()
    categories = job.get("categories", [])
    cat_names = [c.get("category", "") if isinstance(c, dict) else str(c) for c in categories]
    cat_text = " ".join(cat_names).lower()

    score = 0
    notes = []

    title_hit = next((t for t in target_titles if t.lower() in title), None)
    if title_hit:
        score += 14
        notes.append(f"title matches '{title_hit}'")
    else:
        # partial credit for related words
        related = ["sales", "engineer", "architect", "consultant", "technical"]
        if any(r in title for r in related):
            score += 6
            notes.append("title loosely related")
        else:
            notes.append("title not related to target role")

    domain_terms = ["it", "infocomm", "technology", "computer", "sales", "engineering"]
    if any(d in cat_text for d in domain_terms):
        score += 6
        notes.append(f"category fits: {', '.join(cat_names) or 'n/a'}")
    else:
        notes.append(f"category: {', '.join(cat_names) or 'n/a'}")

    return min(score, 20), "; ".join(notes)


def score_job(job: dict, resume_keywords: set) -> JobScore:
    desc_text = strip_html(job.get("description"))
    skills = job.get("skills", []) or []

    kw_score, matched_key, matched_other = keyword_overlap_score(resume_keywords, skills, desc_text)
    sen_score, sen_notes = seniority_score(
        job, RESUME_PROFILE["years_experience"], RESUME_PROFILE["target_levels"]
    )
    role_score, role_notes = role_relevance_score(job, RESUME_PROFILE["target_titles"])

    total = kw_score + sen_score + role_score

    breakdown = {
        "keyword_overlap (max 60)": kw_score,
        "seniority_match (max 20)": sen_score,
        "role_relevance (max 20)": role_score,
        "matched_key_skills": ", ".join(matched_key) or "none",
        "matched_other_skills": ", ".join(matched_other) or "none",
        "seniority_notes": sen_notes,
        "role_notes": role_notes,
    }

    reason_parts = []
    if matched_key:
        reason_parts.append(f"key skills: {', '.join(matched_key[:4])}")
    reason_parts.append(sen_notes.split(";")[0])
    reason_parts.append(role_notes.split(";")[0])
    reason = " | ".join(reason_parts)

    js = JobScore(job=job, total=total, breakdown=breakdown, reason=reason)
    return js


# --------------------------------------------------------------------------
# Output
# --------------------------------------------------------------------------


def format_salary(job: dict) -> str:
    salary = job.get("salary") or {}
    lo, hi = salary.get("minimum"), salary.get("maximum")
    stype = salary.get("type", {})
    type_name = stype.get("salaryType") if isinstance(stype, dict) else stype
    if lo is None and hi is None:
        return ""
    return f"{lo or '?'}-{hi or '?'} ({type_name or ''})".strip()


def format_employment_types(job: dict) -> str:
    types = job.get("employmentTypes", [])
    return ", ".join(t.get("employmentType", str(t)) if isinstance(t, dict) else str(t) for t in types)


def format_position_levels(job: dict) -> str:
    levels = job.get("positionLevels", [])
    return ", ".join(l.get("position", str(l)) if isinstance(l, dict) else str(l) for l in levels)


def write_csv(scores: list, out_path: Path):
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "score", "title", "company", "salary_range", "employment_type",
            "position_level", "mcf_job_url", "reason",
        ])
        for js in scores:
            job = js.job
            writer.writerow([
                js.total,
                job.get("title", ""),
                (job.get("postedCompany") or {}).get("name", ""),
                format_salary(job),
                format_employment_types(job),
                format_position_levels(job),
                (job.get("metadata") or {}).get("jobDetailsUrl", ""),
                js.reason,
            ])


def print_summary(scores: list):
    print(f"\nTotal unique jobs scored: {len(scores)}")

    buckets = Counter()
    for js in scores:
        bucket = f"{(js.total // 10) * 10}-{(js.total // 10) * 10 + 9}"
        buckets[bucket] += 1
    print("\nScore distribution:")
    for bucket in sorted(buckets, key=lambda b: int(b.split("-")[0]), reverse=True):
        print(f"  {bucket}: {buckets[bucket]}")

    print("\nTop 10:")
    for i, js in enumerate(scores[:10], 1):
        job = js.job
        company = (job.get("postedCompany") or {}).get("name", "?")
        print(f"  {i:2d}. [{js.total:3d}] {job.get('title', '?')} — {company}")
        print(f"       {js.reason}")
        url = (job.get("metadata") or {}).get("jobDetailsUrl", "")
        if url:
            print(f"       {url}")


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------


def prompt_resume_path(cli_value: Optional[str]) -> Path:
    if cli_value:
        return Path(cli_value).expanduser()
    raw = input(f"Resume file path [{DEFAULT_RESUME_PATH}]: ").strip()
    return Path(raw or DEFAULT_RESUME_PATH).expanduser()


def prompt_search_terms(cli_value: Optional[str]) -> list:
    if cli_value:
        return [t.strip() for t in cli_value.split(",") if t.strip()]
    default_str = ", ".join(DEFAULT_SEARCH_TERMS)
    raw = input(f"Search terms, comma-separated [{default_str}]: ").strip()
    if not raw:
        return DEFAULT_SEARCH_TERMS
    return [t.strip() for t in raw.split(",") if t.strip()]


def main():
    parser = argparse.ArgumentParser(description="Score MCF SG job listings against your resume.")
    parser.add_argument("--resume", help="Path to resume PDF or text file")
    parser.add_argument("--terms", help="Comma-separated search terms (overrides interactive prompt)")
    parser.add_argument("--max-per-term", type=int, default=DEFAULT_MAX_PER_TERM)
    parser.add_argument("--out", default="mcf_job_matches.csv", help="Output CSV path")
    parser.add_argument("--non-interactive", action="store_true",
                         help="Skip prompts; use defaults/CLI args only")
    args = parser.parse_args()

    if args.non_interactive:
        resume_path = Path(args.resume or DEFAULT_RESUME_PATH).expanduser()
        terms = [t.strip() for t in (args.terms or ",".join(DEFAULT_SEARCH_TERMS)).split(",") if t.strip()]
    else:
        resume_path = prompt_resume_path(args.resume)
        terms = prompt_search_terms(args.terms)

    print(f"\nUsing resume: {resume_path}")
    print(f"Search terms ({len(terms)}): {', '.join(terms)}\n")

    try:
        resume_text = load_resume_text(resume_path)
    except FileNotFoundError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)

    resume_keywords = extract_resume_keywords(resume_text)
    print(f"Extracted {len(resume_keywords)} resume keywords.\n")

    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})

    jobs_by_uuid = {}
    for term in terms:
        print(f"Searching '{term}'...")
        results = search_jobs(term, args.max_per_term, session)
        print(f"  -> {len(results)} results")
        for job in results:
            uuid = job.get("uuid")
            if uuid and uuid not in jobs_by_uuid:
                jobs_by_uuid[uuid] = job
        time.sleep(REQUEST_DELAY_SECONDS)

    print(f"\nTotal unique jobs across all terms: {len(jobs_by_uuid)}")

    scores = [score_job(job, resume_keywords) for job in jobs_by_uuid.values()]
    scores.sort(key=lambda js: js.total, reverse=True)

    out_path = Path(args.out)
    write_csv(scores, out_path)
    print(f"\nWrote {len(scores)} scored jobs to {out_path}")

    print("\n--- Sample scoring breakdown (top job) ---")
    if scores:
        top = scores[0]
        print(f"{top.job.get('title')} — {top.total}/100")
        for k, v in top.breakdown.items():
            print(f"  {k}: {v}")

    print_summary(scores)


if __name__ == "__main__":
    main()
