import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme");

const config: Config = {
  // FIXED: Point to root app/components since you don't have src
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", 
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B", 
        surface: "rgba(10, 10, 11, 0.7)",
        primary: {
          DEFAULT: "#3B82F6",
          dim: "rgba(59, 130, 246, 0.2)",
          glow: "rgba(59, 130, 246, 0.5)",
        },
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-sora)", ...fontFamily.sans],
        mono: ["var(--font-fira-code)", ...fontFamily.mono],
      },
      animation: {
        "scanline": "scanline 2s linear infinite",
        "glitch-shake": "glitch 0.3s cubic-bezier(.25, .46, .45, .94) both",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Ensure you have this or remove if not installed
  ],
};
export default config;