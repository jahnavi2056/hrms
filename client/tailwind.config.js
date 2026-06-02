export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Clash Display"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
          400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
          800: '#166534', 900: '#14532d', 950: '#052e16',
        },
        dark: {
          50: '#f8f9fc', 100: '#f1f3f9', 200: '#e2e6f0',
          800: '#1a1d2e', 850: '#141624', 900: '#0e1020',
          950: '#090b14',
        },
        accent: {
          violet: '#8b5cf6', blue: '#3b82f6', cyan: '#06b6d4',
          emerald: '#10b981', amber: '#f59e0b', rose: '#f43f5e',
          orange: '#f97316', lime: '#84cc16',
        },
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(228,100%,74%,0.05) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.05) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.03) 0px, transparent 50%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
        'glow-brand': 'radial-gradient(circle at center, rgba(34,197,94,0.15) 0%, transparent 70%)',
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'count': 'count 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'border-spin': 'borderSpin 3s linear infinite',
      },
      keyframes: {
        slideUp:     { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:      { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn:     { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        shimmer:     { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
        pulseGreen:  { '0%,100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(34,197,94,0)' } },
        float:       { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        count:       { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        borderSpin:  { to: { transform: 'rotate(360deg)' } },
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-lg': '0 4px 8px rgba(0,0,0,0.4), 0 16px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
        'glow-brand': '0 0 24px rgba(34,197,94,0.3), 0 0 48px rgba(34,197,94,0.1)',
        'glow-violet': '0 0 24px rgba(139,92,246,0.3)',
        'glow-blue': '0 0 24px rgba(59,130,246,0.3)',
        'inner': 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
};
