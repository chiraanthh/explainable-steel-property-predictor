/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#0a0a0f",
        panel: "#12121a",
        border: "#1f1f2e",
        primary: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        secondary: {
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
        },
        destructive: {
          400: "#f87171",
          500: "#ef4444",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(6, 182, 212, 0.4)",
        "glow-purple": "0 0 20px rgba(168, 85, 247, 0.4)",
        panel: "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
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
