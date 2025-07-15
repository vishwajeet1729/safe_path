// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'animated-gradient': "linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #0f0c29)",
      },
      animation: {
        'gradient-x': 'gradientX 10s ease infinite',
      },
      keyframes: {
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
