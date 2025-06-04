/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Include your main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // <--- IMPORTANT: Add jsx and tsx
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}