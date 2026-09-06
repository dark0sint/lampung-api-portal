/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0E1B2B', 2: '#16283D', 3: '#1E3350' },
        paper: '#F7F5EF',
        gold: { DEFAULT: '#C89B3C', light: '#E4C878' },
        teal: { DEFAULT: '#1F7A6C', light: '#2E9C8B' },
        ink_text: '#1B2430',
        muted: '#6B7280',
        danger: '#C4453D',
        success: '#2F855A',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
