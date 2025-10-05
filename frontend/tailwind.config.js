const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        background: '#F8FAFD',
        surface: '#FFFFFF',
        'primary-text': '#0B0C10',
        'secondary-text': '#3E4755',
        accent: '#00BFFF',
        'accent-hover': '#0099E6',
        border: '#E2E8F0',
        disabled: '#AAB4C4',
        
        // Dark mode colors
        'dark-background': '#0B0C10',
        'dark-surface': '#242936',
        'dark-primary-text': '#E6F1FF',
        'dark-secondary-text': '#A9B4C9',
        'dark-accent': '#00BFFF',
        'dark-accent-hover': '#33CCFF',
        'dark-border': '#363D50',
        'dark-disabled': '#5B6475',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

