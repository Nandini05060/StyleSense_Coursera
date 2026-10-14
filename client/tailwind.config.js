/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F7F4F0',
          50: '#FAF8F5',
          100: '#F7F4F0',
          200: '#EFEAE2',
          300: '#E5DED5',
        },
        beige: {
          DEFAULT: '#E5DED5',
          light: '#EFEAE2',
          dark: '#D8CFC4',
        },
        charcoal: {
          DEFAULT: '#191817',
          light: '#2E2B28',
          muted: '#45413D',
        },
        burgundy: {
          DEFAULT: '#762D3D',
          hover: '#5C202E',
          50: '#F8EFF1',
          100: '#F2DFE3',
          300: '#C77A8B',
          600: '#762D3D',
          700: '#5C202E',
          800: '#461722',
        },
        taupe: {
          DEFAULT: '#91877F',
          muted: '#A59D96',
          light: '#D7D0C8',
          border: '#D7D0C8',
        },
        fine: {
          border: '#D7D0C8',
        },
        warmwhite: '#FFFFFF',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(25, 24, 23, 0.04)',
        editorial: '0 8px 30px -8px rgba(25, 24, 23, 0.08)',
        hover: '0 12px 30px -8px rgba(118, 45, 61, 0.12)',
      },
    },
  },
  plugins: [],
}
