/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FACC15', // Yellow accent
        'slate-900': '#0F172A', // Main background
        'slate-800': '#1E293B', // Card background
        success: '#22C55E',
        error: '#EF4444',
      },
    },
  },
  plugins: [],
}
