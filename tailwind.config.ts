import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fitia: {
          yellow: "#FFC800",       // Color de acción principal (CTA)
          dark: "#1A1A1A",         // Texto sobre amarillo y títulos
          cream: "#FAF8F4",        // Fondo suave de tarjetas y paywall
          surface: "#F7F7F8",      // Fondo de inputs y píldoras
          green: "#22C55E",        // Indicador de éxito / meta
        },
        macro: {
          protein: "#C86A3E",      // Teja / Terracota
          carbs: "#E5A96A",        // Trigo / Ocre dorado
          fat: "#A8A26A",          // Oliva suave tostado
        },
      },
      borderRadius: {
        "4xl": "2rem",             // 32px para tarjetas principales
      },
    },
  },
  plugins: [],
};

export default config;
