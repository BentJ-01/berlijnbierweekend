/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0b0c',
        card: '#18181b',
        line: '#27272a',
      },
    },
  },
  plugins: [],
}
