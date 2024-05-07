import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        gray: {
          "50": "#f7f7f8",
          "100": "#efeef0",
          "200": "#dcd9de",
          "300": "#bcb8c1",
          "400": "#97919f",
          "500": "#7b7483",
          "600": "#635c6a",
          "700": "#524c58",
          "800": "#47414b",
          "900": "#3d3941",
          "950": "#29262b",
        },

        blue: {
          "50": "#f2f7fb",
          "100": "#e7f0f8",
          "200": "#d3e2f2",
          "300": "#b9cfe8",
          "400": "#9cb6dd",
          "500": "#839dd1",
          "600": "#6a7fc1",
          "700": "#6374ae",
          "800": "#4a5989",
          "900": "#414e6e",
          "950": "#262c40",
        },
        red: {
          "50": "#fef2f4",
          "100": "#fde6e9",
          "200": "#fbd0d9",
          "300": "#f7aab9",
          "400": "#f27a93",
          "500": "#e63f66",
          "600": "#d42a5b",
          "700": "#b21e4b",
          "800": "#951c45",
          "900": "#801b40",
          "950": "#470a1f",
        },
        green: {
          "50": "#f6faf3",
          "100": "#e9f5e3",
          "200": "#d3eac8",
          "300": "#afd89d",
          "400": "#82bd69",
          "500": "#61a146",
          "600": "#4c8435",
          "700": "#3d692c",
          "800": "#345427",
          "900": "#2b4522",
          "950": "#13250e",
        },
        orange: {
          "50": "#fffbea",
          "100": "#fff5c5",
          "200": "#ffe986",
          "300": "#ffd847",
          "400": "#ffc51d",
          "500": "#fca304",
          "600": "#e07a00",
          "700": "#b95404",
          "800": "#96410a",
          "900": "#7f370c",
          "950": "#471a01",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
