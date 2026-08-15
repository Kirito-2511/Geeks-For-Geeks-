/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas:  '#f8fffe',
        brand:   '#2e7d32',
        accent:  '#4caf50',
        'brand-light': '#e8f5e9',
      },
      fontFamily: {
        sans: ['"Inter"', '"Roboto"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '9xl':  ['8rem',   { lineHeight: '0.85', letterSpacing: '-0.04em' }],
        '10xl': ['10rem',  { lineHeight: '0.82', letterSpacing: '-0.05em' }],
        '11xl': ['12rem',  { lineHeight: '0.80', letterSpacing: '-0.05em' }],
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
        fadeUp:  'fadeUp 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
};
