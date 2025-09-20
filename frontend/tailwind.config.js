/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#006400',    // Green
        secondary: '#008000',  // Lighter green
        accent: '#FFD700',     // Yellow
        background: '#F8F8F0', // Very light yellow-white background
        text: '#333333',       // Dark text
        lightText: '#666666',  // Lighter text
        white: '#ffffff',
        lightAccent: '#FFECB3' // Light yellow
      },
    },
  },
  plugins: [],
}
