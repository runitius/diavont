'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-obsidian"
      id="home"
    >
      {/* Parallax background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY }}
      >
        <div className="hero-glow absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(200,169,110,0.06) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-8 h-8 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-7 h-7"
          style={{ borderTop: '1px solid rgba(200,169,110,0.45)', borderLeft: '1px solid rgba(200,169,110,0.45)' }}
        />
      </div>
      <div className="absolute top-8 right-8 w-8 h-8 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-7 h-7"
          style={{ borderTop: '1px solid rgba(200,169,110,0.45)', borderRight: '1px solid rgba(200,169,110,0.45)' }}
        />
      </div>
      <div className="absolute bottom-8 left-8 w-8 h-8 pointer-events-none">
        <div
          className="absolute bottom-0 left-0 w-7 h-7"
          style={{ borderBottom: '1px solid rgba(200,169,110,0.45)', borderLeft: '1px solid rgba(200,169,110,0.45)' }}
        />
      </div>
      <div className="absolute bottom-8 right-8 w-8 h-8 pointer-events-none">
        <div
          className="absolute bottom-0 right-0 w-7 h-7"
          style={{ borderBottom: '1px solid rgba(200,169,110,0.45)', borderRight: '1px solid rgba(200,169,110,0.45)' }}
        />
      </div>

      {/* EST label bottom-right */}
      <div className="absolute bottom-10 right-10 z-10">
        <span className="font-montserrat text-stone text-[0.6rem] tracking-[0.25em] uppercase">
          EST. 1987
        </span>
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-[1200px] mx-auto"
        style={{ opacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <motion.div variants={itemVariants} className="text-reveal mb-6 md:mb-8">
          <span className="font-montserrat text-gold text-[0.65rem] tracking-[0.45em] uppercase">
            Fine Jewelry &amp; Diamonds
          </span>
        </motion.div>

        {/* Gold thin line above title */}
        <motion.div
          variants={itemVariants}
          className="w-px h-10 bg-gold opacity-30 mb-6 md:mb-8"
        />

        {/* Main title */}
        <motion.div variants={itemVariants} className="text-reveal">
          <h1
            className="font-cormorant font-light text-cream leading-none tracking-[0.15em] uppercase"
            style={{ fontSize: 'clamp(4.5rem, 14vw, 13rem)' }}
          >
            DIAVONT
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div variants={itemVariants} className="text-reveal mt-5 md:mt-7">
          <p className="font-cormorant text-stone italic text-xl md:text-2xl lg:text-3xl font-light tracking-wide">
            Where diamonds meet destiny
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-5 mt-10 md:mt-12"
        >
          <a href="#collections" className="btn-gold px-8 py-3">
            <span>Explore Collections</span>
          </a>
          <a
            href="#craftsmanship"
            className="font-montserrat text-stone text-xs tracking-[0.2em] uppercase hover:text-gold transition-colors duration-300 border-b border-stone border-opacity-40 pb-px hover:border-gold"
          >
            Our Story
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <span className="font-montserrat text-stone text-[0.55rem] tracking-[0.35em] uppercase">
          Scroll
        </span>
        <div
          className="w-px h-10 relative overflow-hidden"
          style={{ background: 'rgba(138,121,104,0.25)' }}
        >
          <div
            className="scroll-dot absolute top-0 left-0 right-0 w-px bg-gold"
            style={{ height: '40%' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
