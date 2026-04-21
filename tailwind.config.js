/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Adding a custom neon emerald for your money app look
        brand: '#10b981', 
      }
    },
  },
  plugins: [],
}