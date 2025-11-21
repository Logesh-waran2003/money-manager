/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        zinc: {
          950: "#09090B", // Deep Space Background
        },
        neon: {
          primary: "#00FF94", // Cyberpunk Green
          secondary: "#FF0055", // Neon Red/Pink
          blue: "#00F0FF", // Electric Blue
        },
      },
    },
  },
  plugins: [],
};
