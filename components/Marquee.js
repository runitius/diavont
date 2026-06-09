'use client';

export default function Marquee() {
  const text = 'CRAFTED BY HAND · BORN FROM FIRE · WORN FOR ETERNITY · SINCE 1987 · ';

  return (
    <section className="py-5 bg-dark-surface overflow-hidden border-y border-dark-border">
      <div className="relative flex">
        <div className="marquee-track flex shrink-0">
          {/* Repeat content to fill the track seamlessly */}
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="font-cormorant text-gold font-light tracking-[0.35em] text-sm md:text-base whitespace-nowrap px-4"
            >
              {text}
            </span>
          ))}
        </div>
        <div className="marquee-track flex shrink-0" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="font-cormorant text-gold font-light tracking-[0.35em] text-sm md:text-base whitespace-nowrap px-4"
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
