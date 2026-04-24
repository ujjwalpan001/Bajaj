/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dce8ff",
          200: "#b2ccff",
          300: "#80aeff",
          400: "#4d8bff",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#1e3270",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "spin-slow": "spin 1.5s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(37,99,235,0)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(37,99,235,0.3)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "70%": { transform: "scale(1.02)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
