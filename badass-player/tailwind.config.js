export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Chivo Mono", "monospace"],
      },
      colors: {
        neon: {
          cyan: "#00F9FF",
          purple: "#AB67FF",
          pink: "#FF2E9D",
        },
      },
    },
  },
  plugins: [],
}
