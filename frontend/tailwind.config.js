/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0B0F19',
        'dark-surface': '#131B2C',
        'neon-green': '#00FF9D',
        'text-primary': '#FFFFFF',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
        'border-dark': '#1E293B',
        'accent-blue': '#3B82F6',
        'accent-purple': '#8B5CF6',
      }
    },
  },
  plugins: [],
}
