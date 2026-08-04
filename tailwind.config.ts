import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        klayer: {
          bg: "#FAF8F4",
          card: "#FFFFFF",
          border: "#E7E2D8",
          ink: "#2A2622",
          muted: "#78716C",
        },
        brand: {
          DEFAULT: "#12222C",
          dark: "#0B161D",
          light: "#1C333F",
          bg: "#EDF1F2",
          border: "#D3DBDD",
        },
        smarter: {
          DEFAULT: "#2563EB",
          bg: "#EFF4FE",
          border: "#BFD3FB",
        },
        faster: {
          DEFAULT: "#16A34A",
          bg: "#EEF9F1",
          border: "#BEE6CB",
        },
        agentic: {
          DEFAULT: "#7C3AED",
          bg: "#F4EFFE",
          border: "#D9C8FA",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(42, 38, 34, 0.06), 0 1px 8px rgba(42, 38, 34, 0.04)",
      },
      borderRadius: {
        xl2: "1rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
