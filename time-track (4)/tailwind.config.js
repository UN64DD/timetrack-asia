/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#ccff00",
        "dark-bg": "#050505",
        "card-bg": "#0a0a0a",
        "text-secondary": "#a1a1a1",
      },
      fontFamily: {
        sans: ["Product Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Product Sans", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
