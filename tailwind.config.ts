import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Be Vietnam Pro", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          muted: "var(--primary-muted)",
        },
        income: {
          DEFAULT: "var(--income)",
          bg: "var(--income-bg)",
          border: "var(--income-border)",
        },
        expense: {
          DEFAULT: "var(--expense)",
          bg: "var(--expense-bg)",
          border: "var(--expense-border)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
