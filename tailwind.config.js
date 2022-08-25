/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        theme: {
          ["50"]: "rgb(var(--color-50) / <alpha-value>)",
          ["100"]: "rgb(var(--color-100) / <alpha-value>)",
          ["200"]: "rgb(var(--color-200) / <alpha-value>)",
          ["300"]: "rgb(var(--color-300) / <alpha-value>)",
          ["400"]: "rgb(var(--color-400) / <alpha-value>)",
          ["500"]: "rgb(var(--color-500) / <alpha-value>)",
          ["600"]: "rgb(var(--color-600) / <alpha-value>)",
          ["700"]: "rgb(var(--color-700) / <alpha-value>)",
          ["800"]: "rgb(var(--color-800) / <alpha-value>)",
          ["900"]: "rgb(var(--color-900) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
