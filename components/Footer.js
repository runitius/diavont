'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const footerLinks = {
  Collections: ['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Bespoke'],
  Craftsmanship: ['Our Process', 'Sourcing', 'Master Jewellers', 'Certifications'],
  Company: ['About Diavont', 'Press', 'Careers', 'Sustainability', 'Contact'],
  Contact: ['Book Consultation', '+1 (800) 342-8697', 'hello@diavont.com', '14 Place Vendôme, Paris'],
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-dark-surface border-t border-dark-border">
      {/* Large wordmark */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-20 pb-12 border-b border-dark-border">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <div>
            <h2
              className="font-cormorant font-light text-cream/90 leading-none tracking-[0.12em] uppercase"
              style={{ fontSize: 'clamp(3rem, 10vw, 9rem)' }}
            >
              DIAVONT
            </h2>
            <p className="font-cormorant italic text-stone text-lg md:text-xl mt-3 font-light">
              Where diamonds meet destiny
            </p>
          </div>

          {/* Newsletter */}
          <div className="md:w-80 shrink-0">
            <span className="font-montserrat text-stone text-[0.65rem] tracking-[0.25em] uppercase block mb-4">
              Join the Inner Circle
            </span>
            {submitted ? (
              <p className="font-cormorant italic text-gold text-lg">
                Thank you for joining.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-end gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="newsletter-input"
                  />
                </div>
                <button
                  type="submit"
                  className="shrink-0 text-gold hover:text-gold-light transition-colors duration-200 pb-px border-b border-stone/30 hover:border-gold"
                  aria-label="Subscribe"
                >
                  <span className="font-montserrat text-xs tracking-[0.2em] uppercase">
                    &rarr;
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-14 grid grid-cols-2 md:grid-cols-4 gap-10 border-b border-dark-border">
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h3 className="font-montserrat text-cream/80 text-[0.65rem] tracking-[0.25em] uppercase mb-5">
              {heading}
            </h3>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="font-montserrat text-stone hover:text-cream transition-colors duration-200 text-xs tracking-wide"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-montserrat text-stone/60 text-[0.6rem] tracking-[0.15em] uppercase">
          &copy; {new Date().getFullYear()} Diavont. All rights reserved.
        </span>
        <div className="flex items-center gap-4">
          <span className="gold-line w-8" />
          <span className="font-montserrat text-stone/50 text-[0.6rem] tracking-[0.2em] uppercase">
            Crafted with care
          </span>
        </div>
        <div className="flex items-center gap-5">
          {['Privacy', 'Terms', 'Cookies'].map((item) => (
            <a
              key={item}
              href="#"
              className="font-montserrat text-stone/50 hover:text-stone text-[0.6rem] tracking-[0.15em] uppercase transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
