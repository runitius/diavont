/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0806',
        gold: '#C8A96E',
        'gold-light': '#E8C98E',
        'gold-dark': '#A08848',
        cream: '#F2EDE4',
        stone: '#8A7968',
        'dark-border': '#2A2318',
        'dark-surface': '#12100C',
        'dark-elevated': '#1A1610',
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        montserrat: ['var(--font-montserrat)', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display': 'clamp(5rem, 15vw, 14rem)',
        'display-sm': 'clamp(3rem, 8vw, 7rem)',
        'heading': 'clamp(2rem, 5vw, 4rem)',
      },
      letterSpacing: {
        'widest-xl': '0.3em',
        'widest-2xl': '0.5em',
      },
      backgroundImage: {
        'radial-gold': 'radial-gradient(ellipse at center, rgba(200,169,110,0.15) 0%, transparent 70%)',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'cursor-expand': 'cursor-expand 0.2s ease forwards',
        'fade-in': 'fadeIn 1s ease forwards',
        'slide-up': 'slideUp 0.8s ease forwards',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
