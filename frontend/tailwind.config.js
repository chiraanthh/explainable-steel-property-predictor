/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#f6f8fc",
        panel: "#ffffff",
        border: "#e2e8f0",
        primary: {
          50: "#eef2ff",
          400: "#6366f1",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3",
        },
        secondary: {
          50: "#f5f3ff",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        destructive: {
          400: "#fb7185",
          500: "#e11d48",
          600: "#be123c",
        },
      },
      boxShadow: {
        glow: "0 10px 30px -10px rgba(79, 70, 229, 0.45)",
        "glow-purple": "0 10px 30px -10px rgba(124, 58, 237, 0.45)",
        panel: "0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px -12px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
};
