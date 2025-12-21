/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- EXISTING SEMANTIC TOKENS (Keep these!) ---
        background: "#0f172a", // Slate 900
        surface: "#1e293b",    // Slate 800
        primary: "#fbbf24",    // Oly Gold (Beer/Gold)
        accent: "#3b82f6",     // Blue 500 (Artesian Water)

        // --- NEW BRAND TOKENS (For new components) ---
        // We alias these so we can be specific in the future
        'oly-navy': '#0f172a',
        'oly-gold': '#fbbf24',
        'oly-red': '#ef4444',
      },
      fontFamily: {
        'league': ['Oswald', 'sans-serif'],
        'body': ['Roboto Condensed', 'sans-serif'],
      }
    },
  },
  plugins: [],
}