/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAF8F2",
        "paper-warm": "#F3EFE6",
        ink: "#181411",
        "ink-2": "#362F2A",
        mute: "#575049",
        hair: "#DED8CE",
        "hair-dark": "#C8C0B2",
        accent: {
          DEFAULT: "#B91C1C",
          dark: "#8B1111",
          light: "#DC2626",
          wash: "#FEF2F2",
        },
        gold: {
          DEFAULT: "#B45309",
          dark: "#7C2D12",
          light: "#D97706",
          wash: "#FFFBEB",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "Cairo", "sans-serif"],
        amiri: ["Amiri", "serif"],
      },
    },
  },
  plugins: [],
}
