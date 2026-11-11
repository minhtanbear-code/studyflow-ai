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
        calm: {
          slate: "#334155",
          blue: "#2563EB",
          lavender: "#8B5CF6",
          amber: "#D97706",
          sage: "#059669",
          bg: "#F8FAFC",
        },
        pk: {
          primary: "#7C3AED",
          light: "#EDE9FE",
          bg: "#F8F7FC",
          textPrimary: "#17133B",
          textSecondary: "#77738F",
          border: "#E8E4F3",
        },
      },
    },
  },
  plugins: [],
};

export default config;
