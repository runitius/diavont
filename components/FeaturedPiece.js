'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function FeaturedPiece() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="featured" className="py-24 lg:py-0 bg-dark-surface overflow-hidden">
      <div ref={ref} className="max-w-[1400px] mx-auto lg:grid lg:grid-cols-2 lg:min-h-[700px]">
        {/* Left: Ring artwork */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[400px] lg:min-h-0 flex items-center justify-center overflow-hidden"
        >
          <div className="ring-artwork absolute inset-0" />

          {/* Central gem sparkle */}
          <div className="relative z-10 flex items-center justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${(i + 1) * 60}px`,
                  height: `${(i + 1) * 60}px`,
                  border: `1px solid rgba(200,169,110,${0.25 - i * 0.07})`,
                }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 20 + i * 8, repeat: Infinity, ease: 'linear' }}
              />
            ))}
            <div
              className="w-3 h-3 rounded-full bg-gold/80"
              style={{ boxShadow: '0 0 20px 8px rgba(200,169,110,0.25)' }}
            />
          </div>

          {/* Overlay label */}
          <div className="absolute bottom-8 left-8 z-10">
            <span className="font-montserrat text-stone/60 text-[0.6rem] tracking-[0.3em] uppercase">
              The Soleil Ring
            </span>
          </div>
        </motion.div>

        {/* Right: Details */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center px-8 lg:px-16 py-16 lg:py-24"
        >
          <span className="font-montserrat text-stone text-[0.6rem] tracking-[0.4em] uppercase mb-8">
            02 / Featured Piece
          </span>

          <h2
            className="font-cormorant font-light text-cream leading-tight mb-6"
            style={{ fontSize: 'clamp(2.8rem, 5vw, 5.5rem)' }}
          >
            The Soleil Ring
          </h2>

          {/* Spec line */}
          <div className="flex items-center gap-4 mb-8">
            <span className="gold-line" />
            <span className="font-montserrat text-stone/80 text-[0.65rem] tracking-[0.2em] uppercase">
              18k Rose Gold · 3.2ct Diamond
            </span>
          </div>

          <p className="font-montserrat text-stone text-sm leading-relaxed tracking-wide mb-10 max-w-[380px]">
            Inspired by the first light of morning, the Soleil Ring captures the way sunlight fractures
            through a flawless diamond. Set in hand-burnished 18k rose gold, each stone is selected for
            its exceptional brilliance and clarity.
          </p>

          {/* Details list */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-12 max-w-[320px]">
            {[
              ['Cut', 'Round Brilliant'],
              ['Clarity', 'VVS1'],
              ['Colour', 'D–E'],
              ['Carat', '3.20 ct'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-montserrat text-stone/60 text-[0.6rem] tracking-[0.2em] uppercase mb-1">
                  {label}
                </dt>
                <dd className="font-cormorant text-cream text-lg font-light">{value}</dd>
              </div>
            ))}
          </div>

          {/* Price + CTA */}
          <div className="flex items-center gap-8">
            <div>
              <span className="block font-montserrat text-stone/60 text-[0.6rem] tracking-[0.2em] uppercase mb-1">
                From
              </span>
              <span className="font-cormorant text-gold text-3xl font-light">$12,400</span>
            </div>
            <a href="#bespoke" className="btn-gold">
              <span>View Piece</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
