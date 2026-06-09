'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'SOURCING',
    desc: 'Ethically sourced diamonds from certified mines across Botswana, Canada, and Australia.',
  },
  {
    num: '02',
    title: 'DESIGN',
    desc: 'Each piece sketched by hand over 40+ hours by our master jewellery designers.',
  },
  {
    num: '03',
    title: 'SETTING',
    desc: 'Master setters with 20+ years of experience place every stone with surgical precision.',
  },
  {
    num: '04',
    title: 'FINISHING',
    desc: '72-hour quality inspection under 10× magnification before every delivery.',
  },
];

export default function Craftsmanship() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section id="craftsmanship" className="py-24 md:py-32 bg-obsidian">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12" ref={ref}>
        {/* Header */}
        <motion.div
          className="mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-montserrat text-stone text-[0.65rem] tracking-[0.4em] uppercase block mb-5">
            The Art Of
          </span>
          <h2
            className="font-cormorant italic font-light text-cream leading-none"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}
          >
            Craftsmanship
          </h2>
        </motion.div>

        {/* Full-width gold divider */}
        <motion.div
          className="gold-divider mb-14"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 0.4 } : {}}
          style={{ transformOrigin: 'left' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />

        {/* Steps grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {steps.map((step) => (
            <motion.div key={step.num} variants={itemVariants} className="group">
              <div className="mb-5">
                <span className="font-montserrat text-gold text-[0.65rem] tracking-[0.25em] opacity-60">
                  {step.num}
                </span>
              </div>
              <h3 className="font-montserrat text-cream text-sm tracking-[0.2em] uppercase font-medium mb-4 group-hover:text-gold transition-colors duration-300">
                {step.title}
              </h3>
              <p className="font-montserrat text-stone text-xs leading-loose tracking-wide">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom quote */}
        <motion.div
          className="mt-24 border-t border-dark-border pt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <blockquote className="font-cormorant italic text-stone text-xl md:text-2xl font-light max-w-lg leading-relaxed">
            &ldquo;Every stone tells a story. Our craft is to tell it beautifully.&rdquo;
          </blockquote>
          <div className="shrink-0">
            <span className="font-montserrat text-stone/60 text-[0.6rem] tracking-[0.3em] uppercase block mb-1">
              Master Jeweller
            </span>
            <span className="font-cormorant text-gold text-lg font-light">
              Henri Delacroix
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
