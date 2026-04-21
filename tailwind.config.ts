import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: "#fdf8f0",
          100: "#f5e6d3",
          200: "#e8c9a0",
          300: "#d4a06a",
          400: "#c8956c",
          500: "#b8732a",
          600: "#9c5a1a",
          700: "#7d4215",
          800: "#6b3f2a",
          900: "#4a2515",
          950: "#2d1507",
        },
        dark: {
          base: "#0d0805",
          card: "#1a0f0a",
          elevated: "#2d1f17",
          border: "#3d2a1e",
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        steam: "steam 2s ease-in-out infinite",
        "steam-delay": "steam 2s ease-in-out infinite 0.6s",
        "steam-delay2": "steam 2s ease-in-out infinite 1.2s",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.4s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        steam: {
          "0%": { opacity: "0", transform: "translateY(0) scaleX(1)" },
          "40%": { opacity: "0.7" },
          "100%": { opacity: "0", transform: "translateY(-24px) scaleX(1.8)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
