import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f4f8f4",
        ink: "#123126",
        teal: {
          50: "#f0fbf8",
          100: "#c9f2e8",
          200: "#97e5d4",
          300: "#63d4bd",
          400: "#34bb9f",
          500: "#18947e",
          600: "#117565",
          700: "#0e5e52",
          800: "#0e4b42",
          900: "#103d36"
        }
      },
      boxShadow: {
        soft: "0 12px 30px rgba(16, 61, 54, 0.12)"
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Helvetica Neue", "sans-serif"],
        display: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
