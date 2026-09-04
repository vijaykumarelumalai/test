/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1E40AF',
          navy: '#0F172A',
          amber: '#F59E0B',
          emerald: '#10B981',
          rose: '#EF4444',
          purple: '#8B5CF6'
        }
      }
    },
  },
  plugins: [],
}
