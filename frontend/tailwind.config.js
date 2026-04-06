/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // YouTube brand
        yt: {
          DEFAULT: '#FF0000',
          dark: '#CC0000',
        },
        // Instagram brand gradient start/end
        ig: {
          pink: '#E1306C',
          orange: '#F77737',
          purple: '#833AB4',
        },
        // App surface colors
        surface: {
          DEFAULT: '#0F0F13',
          card: '#1A1A22',
          hover: '#23232F',
          border: '#2D2D3D',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'ig-gradient': 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
        'yt-gradient': 'linear-gradient(135deg, #FF0000, #FF6B6B)',
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,119,198,0.15), transparent)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up': 'fadeUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
