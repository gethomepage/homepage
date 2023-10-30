/** @type {import('tailwindcss').Config} */
const tailwindForms = require("@tailwindcss/forms");
const tailwindScrollbars = require("tailwind-scrollbar");

module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/widgets/**/*.{js,ts,jsx,tsx}",
  ],
  variants: {
    extend: {
      display: ["group-hover"],
    },
  },
  theme: {
    extend: {
      colors: {
        theme: {
          50: "rgb(var(--color-50) / <alpha-value>)",
          100: "rgb(var(--color-100) / <alpha-value>)",
          200: "rgb(var(--color-200) / <alpha-value>)",
          300: "rgb(var(--color-300) / <alpha-value>)",
          400: "rgb(var(--color-400) / <alpha-value>)",
          500: "rgb(var(--color-500) / <alpha-value>)",
          600: "rgb(var(--color-600) / <alpha-value>)",
          700: "rgb(var(--color-700) / <alpha-value>)",
          800: "rgb(var(--color-800) / <alpha-value>)",
          900: "rgb(var(--color-900) / <alpha-value>)",
        },
      },
      screens: {
        "3xl": "1800px",
        // => @media (min-width: 1800px) { ... }
      },
    },
  },
  plugins: [tailwindForms, tailwindScrollbars],
  // always include these in build as classes are dynamically constructed
  safelist: [
    "backdrop-blur",
    "backdrop-blur-sm",
    "backdrop-blur-md",
    "backdrop-blur-xl",
    "backdrop-saturate-0",
    "backdrop-saturate-50",
    "backdrop-saturate-100",
    "backdrop-saturate-150",
    "backdrop-saturate-200",
    "backdrop-brightness-0",
    "backdrop-brightness-50",
    "backdrop-brightness-75",
    "backdrop-brightness-90",
    "backdrop-brightness-95",
    "backdrop-brightness-100",
    "backdrop-brightness-105",
    "backdrop-brightness-110",
    "backdrop-brightness-125",
    "backdrop-brightness-150",
    "backdrop-brightness-200",
    "grid-cols-1",
    "md:grid-cols-1",
    "md:grid-cols-2",
    "lg:grid-cols-1",
    "lg:grid-cols-2",
    "lg:grid-cols-3",
    "lg:grid-cols-4",
    "lg:grid-cols-5",
    "lg:grid-cols-6",
    "lg:grid-cols-7",
    "lg:grid-cols-8",
    // for status
    "bg-white",
    "bg-black",
    "dark:bg-white",
    "bg-orange-400",
    "dark:bg-orange-400",
    {
      pattern: /h-([0-96])/,
      variants: ["sm", "md", "lg", "xl", "2xl"],
    },
  ],
};
