/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta Gurupi Telecom — verde como cor principal da marca
        gurupi: {
          50: "#e9f9f0",
          100: "#c9f0db",
          200: "#94e1b8",
          300: "#5ccf92",
          400: "#2bb96f",
          500: "#0f9d58", // principal
          600: "#0c8049",
          700: "#0a6b3f", // escuro (cabeçalhos)
          800: "#08512f",
          900: "#053a22",
        },
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(15, 157, 88, 0.08)",
      },
    },
  },
  plugins: [],
};
