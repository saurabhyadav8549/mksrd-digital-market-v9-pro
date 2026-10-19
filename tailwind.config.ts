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
        brand: {
          green: "#0c831f",
          dark: "#074d12",
          light: "#f0fdf4",
          accent: "#f8cb46",
        },
      },
    },
  },
  plugins: [],
};
export default config;
