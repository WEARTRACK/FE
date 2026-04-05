/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1F6FEB",
          dark: "#174EA6",
          foreground: "#F8FAFC",
        },
        ink: "#111827",
        muted: "#6B7280",
        surface: "#F8FAFC",
      },
    },
  },
  plugins: [],
};
