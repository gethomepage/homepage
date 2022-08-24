/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: ({ colors }) => ({
        theme: colors.slate,
      }),
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
