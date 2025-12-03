/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-yellow': '#efd93e',
        'accent-red': '#f05454',
        'accent-green': '#99f443',
        'dark-bg': '#2d2d2d',
        'dark-card': '#3a3a3a',
        'dark-surface': '#454545',
        'star-color': '#FFA500',
        'bg-beige': '#F3F1E4',
      },
      fontFamily: {
        'segoe': ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
