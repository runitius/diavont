'use client';

import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const SHAPES = [
  { id: 'round',    name: 'Round'    },
  { id: 'pear',     name: 'Pear'     },
  { id: 'emerald',  name: 'Emerald'  },
  { id: 'oval',     name: 'Oval'     },
  { id: 'heart',    name: 'Heart'    },
  { id: 'marquise', name: 'Marquise' },
  { id: 'cushion',  name: 'Cushion'  },
];

const METALS = [
  { id: 'yellow', name: 'Yellow Gold', sub: '18k', color: '#C8A96E', hi: '#EDD898', lo: '#9A7840' },
  { id: 'white',  name: 'White Gold',  sub: '18k', color: '#D0D0DC', hi: '#ECECF4', lo: '#9898A8' },
  { id: 'rose',   name: 'Rose Gold',   sub: '18k', color: '#D4997A', hi: '#ECC0A8', lo: '#A87050' },
  { id: 'plat',   name: 'Platinum',    sub: '',    color: '#B8B8CC', hi: '#DCDCEC', lo: '#888898' },
];

const CARAT_MIN  = 0.5;
const CARAT_MAX  = 8.0;
const CARAT_STEP = 0.5;

/* ─── Pricing ──────────────────────────────────────────────────────────────── */

function getPrice(shapeId, carat, metalId) {
  const base = { round: 4500, oval: 3800, emerald: 3600, pear: 3400, cushion: 3200, heart: 3300, marquise: 3100 };
  const mAdd = { yellow: 1200, white: 1500, rose: 1350, plat: 2200 };
  const raw  = (base[shapeId] ?? 3500) * Math.pow(carat, 1.8) + (mAdd[metalId] ?? 1200);
  return Math.round(raw / 50) * 50;
}

/* ─── SVG shape definitions (100×100 viewBox) ──────────────────────────────── */

const SHAPE_DEFS = {
  round: {
    type:  'circle',
    attrs: { cx: 50, cy: 50, r: 44 },
    table: '50,22 65,30 72,47 65,64 50,72 35,64 28,47 35,30',
    lines: ['M50,22 L50,6','M65,30 L80,16','M72,47 L92,47','M65,64 L80,80',
            'M50,72 L50,93','M35,64 L20,80','M28,47 L8,47','M35,30 L20,16'],
  },
  oval: {
    type:  'ellipse',
    attrs: { cx: 50, cy: 50, rx: 30, ry: 44 },
    table: '50,16 63,28 68,50 63,72 50,84 37,72 32,50 37,28',
    lines: ['M50,16 L50,6','M63,28 L74,17','M68,50 L80,50','M63,72 L74,83',
            'M50,84 L50,94','M37,72 L26,83','M32,50 L20,50','M37,28 L26,17'],
  },
  cushion: {
    type:  'rect',
    attrs: { x: 8, y: 8, width: 84, height: 84, rx: 14 },
    table: '50,24 65,32 72,47 65,64 50,76 35,64 28,47 35,32',
    lines: ['M50,24 L50,8','M65,32 L80,16','M72,47 L92,47','M65,64 L80,82',
            'M50,76 L50,92','M35,64 L20,82','M28,47 L8,47','M35,32 L20,16'],
  },
  emerald: {
    type:  'polygon',
    attrs: { points: '28,8 72,8 92,28 92,72 72,92 28,92 8,72 8,28' },
    table: '36,24 64,24 78,38 78,62 64,76 36,76 22,62 22,38',
    lines: ['M22,38 L8,28','M22,62 L8,72','M78,38 L92,28','M78,62 L92,72',
            'M22,50 L78,50','M36,24 L36,76','M64,24 L64,76'],
  },
  marquise: {
    type:  'path',
    attrs: { d: 'M4,50 C15,22 32,6 50,6 C68,6 85,22 96,50 C85,78 68,94 50,94 C32,94 15,78 4,50Z' },
    table: '20,50 30,28 50,18 70,28 80,50 70,72 50,82 30,72',
    lines: ['M20,50 L4,50','M30,28 L16,14','M50,18 L50,6','M70,28 L84,14',
            'M80,50 L96,50','M70,72 L84,86','M50,82 L50,94','M30,72 L16,86'],
  },
  pear: {
    type:  'path',
    attrs: { d: 'M50,94 C22,80 6,62 6,44 A44,36 0 0 1 94,44 C94,62 78,80 50,94Z' },
    table: '50,82 34,66 24,48 28,30 40,18 60,18 72,30 76,48 66,66',
    lines: ['M50,82 L50,94','M34,66 L20,76','M24,48 L6,48','M28,30 L14,20',
            'M40,18 L32,6','M60,18 L68,6','M72,30 L86,20','M76,48 L94,48','M66,66 L80,76'],
  },
  heart: {
    type:  'path',
    attrs: { d: 'M50,85 C20,65 4,48 4,34 C4,16 18,6 32,6 C42,6 48,12 50,18 C52,12 58,6 68,6 C82,6 96,16 96,34 C96,48 80,65 50,85Z' },
    table: '50,74 28,56 16,38 24,22 36,16 50,24 64,16 76,22 84,38 72,56',
    lines: ['M50,74 L50,85','M28,56 L14,66','M16,38 L4,34','M24,22 L14,12',
            'M36,16 L30,6','M50,24 L50,18','M64,16 L70,6','M76,22 L86,12',
            'M84,38 L96,34','M72,56 L86,66'],
  },
};

function renderShapeEl(def, extraProps = {}) {
  const { type, attrs } = def;
  if (type === 'circle')   return <circle   {...attrs} {...extraProps} />;
  if (type === 'ellipse')  return <ellipse  {...attrs} {...extraProps} />;
  if (type === 'rect')     return <rect     {...attrs} {...extraProps} />;
  if (type === 'polygon')  return <polygon  {...attrs} {...extraProps} />;
  return                          <path     {...attrs} {...extraProps} />;
}

/* ─── Diamond SVG ──────────────────────────────────────────────────────────── */

function DiamondSVG({ shape, size = 100, metalHi = '#E8C98E' }) {
  const uid  = useId().replace(/:/g, '');
  const def  = SHAPE_DEFS[shape];
  if (!def) return null;

  const clipId = `clip-${uid}`;
  const gradId = `grad-${uid}`;
  const hlId   = `hl-${uid}`;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={gradId} cx="40%" cy="35%" r="70%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
          <stop offset="20%"  stopColor="rgba(235,242,255,0.96)" />
          <stop offset="55%"  stopColor="rgba(190,210,248,0.82)" />
          <stop offset="85%"  stopColor="rgba(148,178,232,0.62)" />
          <stop offset="100%" stopColor="rgba(100,145,215,0.42)" />
        </radialGradient>
        <radialGradient id={hlId} cx="28%" cy="22%" r="38%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"    />
        </radialGradient>
        <clipPath id={clipId}>
          {renderShapeEl(def)}
        </clipPath>
      </defs>

      {/* Diamond body */}
      <g clipPath={`url(#${clipId})`}>
        <rect width="100" height="100" fill={`url(#${gradId})`} />
        <polygon
          points={def.table}
          fill="rgba(255,255,255,0.22)"
          stroke="rgba(200,220,255,0.55)"
          strokeWidth="0.5"
        />
        {def.lines.map((d, i) => (
          <path key={i} d={d} stroke="rgba(160,190,240,0.38)" strokeWidth="0.45" fill="none" />
        ))}
        <rect width="100" height="100" fill={`url(#${hlId})`} />
      </g>

      {/* Shape outline in metal color */}
      {renderShapeEl(def, { fill: 'none', stroke: metalHi, strokeWidth: 1.4, opacity: 0.75 })}
    </svg>
  );
}

/* ─── Ring Preview ─────────────────────────────────────────────────────────── */

function RingPreview({ shape, carat, metal }) {
  const m     = METALS.find(x => x.id === metal);
  const uid   = useId().replace(/:/g, '');
  const scale = 0.48 + (carat / CARAT_MAX) * 0.82;
  const dSize = Math.round(200 * scale);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[520px] select-none">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 55% 45% at 50% 46%, ${m.color}22 0%, transparent 70%)`,
        }}
      />

      {/* Sparkle dots */}
      {[
        { top: '18%', left: '22%', delay: 0    },
        { top: '12%', left: '72%', delay: 0.6  },
        { top: '70%', left: '14%', delay: 1.2  },
        { top: '74%', left: '80%', delay: 0.4  },
        { top: '30%', left: '88%', delay: 0.9  },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{ top: s.top, left: s.left, background: m.hi }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 2.4, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Diamond */}
      <motion.div
        className="relative z-10"
        animate={{ scale, filter: `drop-shadow(0 0 ${Math.round(carat * 5)}px ${m.color}60)` }}
        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={shape}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1,  scale: 1    }}
            exit={   { opacity: 0,  scale: 0.88 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <DiamondSVG shape={shape} size={200} metalHi={m.hi} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Ring shank */}
      <div className="relative z-10" style={{ marginTop: -8 }}>
        <svg width="140" height="90" viewBox="0 0 140 90">
          <defs>
            <linearGradient id={`shank-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={m.lo} />
              <stop offset="25%"  stopColor={m.hi} />
              <stop offset="75%"  stopColor={m.hi} />
              <stop offset="100%" stopColor={m.lo} />
            </linearGradient>
            <linearGradient id={`shank-inner-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={m.lo} stopOpacity="0.7" />
              <stop offset="50%"  stopColor={m.color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={m.lo} stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {/* Outer shank */}
          <path
            d="M 22,4 L 22,50 Q 22,86 70,86 Q 118,86 118,50 L 118,4"
            stroke={`url(#shank-${uid})`}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          {/* Inner shadow */}
          <path
            d="M 31,4 L 31,50 Q 31,75 70,75 Q 109,75 109,50 L 109,4"
            stroke={`url(#shank-inner-${uid})`}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          {/* Edge highlights */}
          <path d="M 22,4 L 22,44" stroke={m.hi} strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M 118,4 L 118,44" stroke={m.hi} strokeWidth="1.5" fill="none" opacity="0.7" />
        </svg>
      </div>

      {/* Carat label */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-montserrat text-xs tracking-widest text-stone uppercase">
        {carat.toFixed(1)} ct &nbsp;·&nbsp; {m.name}
      </p>
    </div>
  );
}

/* ─── Carat Slider ─────────────────────────────────────────────────────────── */

function CaratSlider({ value, onChange }) {
  const ticks = [1, 2, 3, 4, 5, 6, 7, 8];
  const pct   = ((value - CARAT_MIN) / (CARAT_MAX - CARAT_MIN)) * 100;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <span className="font-cormorant text-5xl font-light text-cream leading-none">
            {value.toFixed(1)}
          </span>
          <span className="font-montserrat text-xs text-stone ml-2 tracking-widest">ct</span>
        </div>
        <span className="font-montserrat text-xs text-stone tracking-widest">
          {value < 1 ? 'Delicate' : value < 2 ? 'Classic' : value < 4 ? 'Statement' : 'Extraordinary'}
        </span>
      </div>

      {/* Track */}
      <div className="relative">
        <div className="relative h-px bg-dark-border">
          <div
            className="absolute left-0 top-0 h-px bg-gold transition-all duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={CARAT_MIN}
          max={CARAT_MAX}
          step={CARAT_STEP}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="carat-slider absolute inset-0 w-full opacity-0 h-8 -top-4"
          style={{ cursor: 'none' }}
        />
        {/* Thumb visual */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold border-2 border-obsidian pointer-events-none transition-all duration-200"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>

      {/* Tick labels */}
      <div className="flex justify-between">
        {ticks.map(t => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`font-montserrat text-[10px] tracking-wider transition-colors ${
              value === t ? 'text-gold' : 'text-stone/50 hover:text-stone'
            }`}
          >
            {t}ct
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */

export default function RingCreator() {
  const [shape, setShape] = useState('round');
  const [carat, setCarat] = useState(1.0);
  const [metal, setMetal] = useState('yellow');

  const price       = getPrice(shape, carat, metal);
  const shapeLabel  = SHAPES.find(s => s.id === shape)?.name ?? '';
  const metalObj    = METALS.find(m => m.id === metal);
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="min-h-screen bg-obsidian">

      {/* Page header */}
      <div className="pt-36 pb-12 text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-montserrat text-xs text-gold tracking-[0.4em] uppercase mb-5"
        >
          Ring Creator
        </motion.p>
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-cormorant font-light text-cream"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 0.95 }}
          >
            Design Your Ring
          </motion.h1>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="font-cormorant italic text-stone text-xl mt-4"
        >
          Every detail, entirely yours
        </motion.p>
      </div>

      <div className="gold-divider" />

      {/* Configurator */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 xl:gap-20 items-start">

          {/* ── Left: Config panel ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0  }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-14"
          >

            {/* Step 01 – Shape */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <span className="font-cormorant text-4xl text-gold/30 font-light leading-none">01</span>
                <div>
                  <p className="font-montserrat text-[10px] text-stone tracking-[0.25em] uppercase mb-0.5">Step One</p>
                  <h2 className="font-cormorant text-2xl text-cream font-light">Choose Your Shape</h2>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {SHAPES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    className={`group flex flex-col items-center gap-2 py-3 px-1 border transition-all duration-300 ${
                      shape === s.id
                        ? 'border-gold/60 bg-gold/8'
                        : 'border-dark-border hover:border-stone/40'
                    }`}
                  >
                    <div className={`transition-all duration-300 ${shape === s.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}`}>
                      <DiamondSVG
                        shape={s.id}
                        size={42}
                        metalHi={shape === s.id ? metalObj.hi : '#8A7968'}
                      />
                    </div>
                    <span className={`font-montserrat text-[9px] tracking-widest uppercase transition-colors ${
                      shape === s.id ? 'text-gold' : 'text-stone group-hover:text-cream'
                    }`}>
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 02 – Carat */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <span className="font-cormorant text-4xl text-gold/30 font-light leading-none">02</span>
                <div>
                  <p className="font-montserrat text-[10px] text-stone tracking-[0.25em] uppercase mb-0.5">Step Two</p>
                  <h2 className="font-cormorant text-2xl text-cream font-light">Select Carat Weight</h2>
                </div>
              </div>
              <CaratSlider value={carat} onChange={setCarat} />

              {/* Size reference */}
              <div className="mt-6 flex items-center gap-3">
                <p className="font-montserrat text-[10px] text-stone/60 tracking-wider uppercase">Size reference</p>
                <div className="flex items-end gap-2">
                  {[0.5, 1, 2, 4, 8].map(ref => {
                    const s = 8 + (ref / 8) * 22;
                    return (
                      <div
                        key={ref}
                        className="rounded-full border transition-all duration-300"
                        style={{
                          width:  s,
                          height: s,
                          borderColor: Math.abs(carat - ref) < 0.3 ? metalObj.color : '#2A2318',
                          background:  Math.abs(carat - ref) < 0.3 ? `${metalObj.color}30` : 'transparent',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Step 03 – Metal */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <span className="font-cormorant text-4xl text-gold/30 font-light leading-none">03</span>
                <div>
                  <p className="font-montserrat text-[10px] text-stone tracking-[0.25em] uppercase mb-0.5">Step Three</p>
                  <h2 className="font-cormorant text-2xl text-cream font-light">Choose Your Metal</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {METALS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMetal(m.id)}
                    className={`group flex flex-col items-center gap-3 py-4 px-3 border transition-all duration-300 ${
                      metal === m.id
                        ? 'border-gold/60'
                        : 'border-dark-border hover:border-stone/40'
                    }`}
                  >
                    {/* Swatch */}
                    <div
                      className="w-8 h-8 rounded-full ring-1 ring-offset-2 ring-offset-obsidian transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${m.hi} 0%, ${m.color} 50%, ${m.lo} 100%)`,
                        ringColor:  metal === m.id ? m.color : 'transparent',
                      }}
                    />
                    <div className="text-center">
                      <p className={`font-montserrat text-[9px] tracking-widest uppercase transition-colors ${
                        metal === m.id ? 'text-gold' : 'text-stone group-hover:text-cream'
                      }`}>
                        {m.name}
                      </p>
                      {m.sub && (
                        <p className="font-montserrat text-[9px] text-stone/50 tracking-wider">{m.sub}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Summary */}
            <section className="border border-dark-border p-6 space-y-4">
              <p className="font-montserrat text-[10px] text-gold tracking-[0.3em] uppercase">Your Selection</p>
              <div className="gold-divider" />
              <dl className="space-y-2.5">
                {[
                  ['Diamond Shape', shapeLabel],
                  ['Carat Weight', `${carat.toFixed(1)} ct`],
                  ['Metal',        `${metalObj.name}${metalObj.sub ? ` ${metalObj.sub}` : ''}`],
                  ['Setting',      '4-Prong Solitaire'],
                  ['Certificate',  'GIA Certified'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-baseline">
                    <dt className="font-montserrat text-xs text-stone tracking-wider">{label}</dt>
                    <dd className="font-cormorant text-cream text-lg font-light">{val}</dd>
                  </div>
                ))}
              </dl>
              <div className="gold-divider" />
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-montserrat text-xs text-stone tracking-widest uppercase">Estimated Price</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={formattedPrice}
                    initial={{ opacity: 0, y: 8  }}
                    animate={{ opacity: 1, y: 0  }}
                    exit={   { opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="font-cormorant text-3xl text-gold font-light"
                  >
                    {formattedPrice}
                  </motion.span>
                </AnimatePresence>
              </div>
              <p className="font-montserrat text-[9px] text-stone/50 tracking-wider">
                Price is an estimate. Final quote provided after consultation.
              </p>
            </section>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/#bespoke" className="btn-gold flex-1 text-center py-4">
                <span>Book Consultation</span>
              </Link>
              <button className="flex-1 border border-dark-border text-stone hover:text-cream hover:border-stone/60 transition-colors py-4 font-montserrat text-xs tracking-widest uppercase">
                Save to Wishlist
              </button>
            </div>
          </motion.div>

          {/* ── Right: Preview ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0  }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:sticky lg:top-28"
          >
            <div className="border border-dark-border bg-dark-surface">
              <RingPreview shape={shape} carat={carat} metal={metal} />
              <div className="gold-divider" />
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-montserrat text-[9px] text-stone tracking-widest uppercase mb-1">
                    {shapeLabel} Brilliant
                  </p>
                  <p className="font-cormorant text-cream text-xl font-light">
                    {carat.toFixed(1)}ct &middot; {metalObj.name}
                    {metalObj.sub ? ` ${metalObj.sub}` : ''}
                  </p>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={formattedPrice}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={   { opacity: 0 }}
                    className="font-cormorant text-2xl text-gold font-light"
                  >
                    {formattedPrice}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Details below preview */}
            <div className="mt-6 grid grid-cols-3 gap-px bg-dark-border">
              {[
                { label: 'Clarity', value: 'VS1–VVS2' },
                { label: 'Color',   value: 'D–F'       },
                { label: 'Cut',     value: 'Excellent'  },
              ].map(item => (
                <div key={item.label} className="bg-obsidian p-4 text-center">
                  <p className="font-montserrat text-[9px] text-stone tracking-widest uppercase mb-1">{item.label}</p>
                  <p className="font-cormorant text-cream text-lg font-light">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t border-dark-border py-8 text-center">
        <Link
          href="/"
          className="font-montserrat text-xs text-stone tracking-widest uppercase hover:text-gold transition-colors"
        >
          ← Back to Diavont
        </Link>
      </div>
    </div>
  );
}
