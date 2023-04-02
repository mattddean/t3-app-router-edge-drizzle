/** @type {import("prettier").Config} */
const config = {
  printWidth: 120,
  trailingComma: "all",
  tailwindConfig: "./apps/nextjs/tailwind.config.cjs",
  plugins: ["prettier-plugin-tailwindcss"],
};

module.exports = config;
