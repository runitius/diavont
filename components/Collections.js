'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const collections = [
  {
    number: '01',
    name: 'Rings',
    label: 'RINGS',
    count: '48 pieces',
    gradient: 'card-rings',
    desc: 'Solitaires, eternity bands & bespoke engagement rings',
  },
  {
    number: '02',
    name: 'Necklaces',
    label: 'NECKLACES',
    count: '36 pieces',
    gradient: 'card-necklaces',
    desc: 'Pendant drops, tennis chains & statement collars',
  },
  {
    number: '03',
    name: 'Bracelets',
    label: 'BRACELETS',
    count: '29 pieces',
    gradient: 'card-bracelets',
    desc: 'Diamond bangles, link chains & tennis bracelets',
  },
  {
    number: '04',
    name: 'Earrings',
    label: 'EARRINGS',
    count: '54 pieces',
    gradient: 'card-earrings',
    desc: 'Studs, drops, hoops & chandelier pieces',
  },
];

function CollectionCard({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden cursor-none"
      style={{ minHeight: '480px' }}
      data-cursor="hover"
    >
      {/* Background artwork */}
      <div
        className={`absolute inset-0 ${item.gradient} transition-transform duration-700 ease-out group-hover:scale-105`}
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8 lg:p-10" style={{ minHeight: '480px' }}>
        {/* Top: number */}
        <span className="font-montserrat text-gold/70 text-xs tracking-[0.35em]">{item.number}</span>

        {/* Bottom */}
        <div>
          {/* Piece count */}
          <span className="block font-montserrat text-stone text-[0.65rem] tracking-[0.25em] uppercase mb-3">
            {item.count}
          </span>

          {/* Collection name */}
          <h3
            className="font-cormorant font-light text-cream leading-none tracking-wide mb-4"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
          >
            {item.label}
          </h3>

          {/* Description — revealed on hover */}
          <p className="font-montserrat text-stone/80 text-xs leading-relaxed tracking-wide max-w-[260px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 mb-5">
            {item.desc}
          </p>

          {/* Explore link */}
          <a
            href={`#${item.name.toLowerCase()}`}
            className="inline-flex items-center gap-3 font-montserrat text-[0.65rem] tracking-[0.2em] uppercase text-gold/70 group-hover:text-gold transition-colors duration-300"
          >
            <span>Explore</span>
            <span className="block w-0 group-hover:w-6 h-px bg-gold transition-all duration-500 ease-out" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export default function Collections() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  return (
    <section id="collections" className="py-24 lg:py-32 bg-obsidian">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div ref={headerRef} className="mb-16 lg:mb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={headerInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="block font-montserrat text-stone text-[0.6rem] tracking-[0.4em] uppercase mb-4"
            >
              01 / Collections
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-cormorant font-light text-cream leading-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
            >
              Our Curated World
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="font-montserrat text-stone text-xs leading-relaxed max-w-xs tracking-wide"
          >
            Each collection is a meditation on form, light, and the eternal beauty of precious stones.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-dark-border">
          {collections.map((item, i) => (
            <CollectionCard key={item.name} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
