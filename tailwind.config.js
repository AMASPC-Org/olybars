/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OlyBars Brand Colors (Dark Mode First)
        background: "#0f172a", // Slate 900
        surface: "#1e293b",    // Slate 800
        primary: "#eab308",    // Yellow 500 (Beer/Gold)
        accent: "#3b82f6",     // Blue 500 (Artesian Water)
      }
    },
  },
  plugins: [],
}