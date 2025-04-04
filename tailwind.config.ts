/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',  // blue-500
          hover: '#2563eb',    // blue-600
        },
        backstory: {
          text: {
            light: '#171717',
            dark: '#ffffff'
          },
          bg: {
            light: 'rgba(243, 244, 246, 0.5)',
            dark: 'rgba(17, 24, 39, 0.5)'
          }
        }
      }
    },
  },
  plugins: [],
}