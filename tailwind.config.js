/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4be277",
          500: "#4be277",
          600: "#22c55e",
          dim: "#4ae176",
        },
        surface: {
          DEFAULT: "#0e150e",
          dim: "#0e150e",
          bright: "#333b33",
          low: "#161d16",
          container: "#1a221a",
          high: "#242c24",
          highest: "#2f372e",
          raised: "#1a221a",
          border: "#3d4a3d",
          variant: "#2f372e",
          tint: "#4ae176",
        },
        "on-surface": "#dce5d9",
        "on-surface-variant": "#bccbb9",
        outline: "#869585",
        "outline-variant": "#3d4a3d",
        primary: {
          DEFAULT: "#4be277",
          container: "#22c55e",
          fixed: "#6bff8f",
          dim: "#4ae176",
        },
        secondary: {
          DEFAULT: "#adc6ff",
          container: "#0566d9",
        },
        tertiary: {
          DEFAULT: "#d1bdff",
          container: "#b89cff",
        },
      },
      fontFamily: {
        inter: ["Inter"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
