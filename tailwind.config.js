
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#143a7b",
          light: "#e7f6ff",
          page: "#f6fbff"
        }
      },
      borderRadius: {
        '3xl': '1.5rem'
      }
    },
  },
  plugins: [],
}
