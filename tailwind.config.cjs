const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        // https://play.tailwindcss.com/YooA6NXDHi?layout=preview
        border: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // https://play.tailwindcss.com/YooA6NXDHi?layout=preview
        border: "border 4s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
