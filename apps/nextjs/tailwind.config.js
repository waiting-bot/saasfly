/** @type {import('tailwindcss').Config} */
const baseConfig = require("@saasfly/tailwind-config");

module.exports = {
  content: [...baseConfig.content, "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
};