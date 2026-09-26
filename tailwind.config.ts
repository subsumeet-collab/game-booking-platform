import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f4f5f1",
        panel: "#ffffff",
        panel2: "#eef0ea",
        border: "#e0e2da",
        fg: "#171a14",
        accent: "#7cb305",
        accent2: "#5e8a04",
        muted: "#6b7062",
        danger: "#dc2626",
        warn: "#b45309",
        live: "#16a34a",
      },
      borderRadius: {
        xl: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
