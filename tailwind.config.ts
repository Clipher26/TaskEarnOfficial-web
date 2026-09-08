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
        slate: {
          950: "#0a0e17",
          900: "#0d1117",
          850: "#111922",
          800: "#161b22",
          700: "#21262d",
        },
        emerald: {
          500: "#22c55e",
          400: "#4ade80",
        },
      },
    },
  },
  plugins: [],
};

export default config;
