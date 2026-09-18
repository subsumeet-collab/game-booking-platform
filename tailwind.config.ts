import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        panel: "#131313",
        panel2: "#1a1a1a",
        border: "#2a2a2a",
        accent: "#c6ff1a",
        accent2: "#9be600",
        muted: "#8a8a8a",
        danger: "#ff4d4f",
        warn: "#e5a412",
        live: "#22c55e",
      },
      borderRadius: {
        xl: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
