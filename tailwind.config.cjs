/** @type {import('tailwindcss').Config}*/
const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  daisyui: {
    themes: ["dark", "light", "lofi"]
  },
  theme: {
    extend: {},
  },

  plugins: [require("daisyui")],
};

module.exports = config;
