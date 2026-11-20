import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { void: "#050a08", panel: "#0a1410", neon: "#39ff9e", dim: "#1c5c44", amber: "#ffb020" },
      fontFamily: { mono: ["var(--font-mono)", "Consolas", "monospace"], display: ["var(--font-display)", "Arial", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
