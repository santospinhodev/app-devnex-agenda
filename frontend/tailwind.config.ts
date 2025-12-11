import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2B5BA8",
        brand: {
          yellow: "var(--color-brand-yellow)",
          blue: "var(--color-brand-blue)",
          navy: "var(--color-brand-navy)",
        },
      },
      borderRadius: {
        xl: "1rem",
      },
      boxShadow: {
        card: "0 10px 35px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
