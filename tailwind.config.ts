import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "900px", // custom
      lg: "1200px",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-prompt)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
