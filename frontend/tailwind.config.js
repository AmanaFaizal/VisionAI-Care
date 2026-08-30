/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f8effaff",
        beige: "#F5F0E6",
        navy: "#1E2A38",
        brandOrange: "#E86B4D",
        cardBlue: "#D5EDFB",
        cardPeach: "#FFE8CD",
        cardMint: "#C8EEDB",
        cardGray: "#E2E8F0",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      }
    },
  },
  plugins: [],
}
