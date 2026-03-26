/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slow-fade': 'slow-fade 0.8s ease-out forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(255, 0, 255, 0.5), 0 0 10px rgba(255, 0, 255, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.8), 0 0 30px rgba(255, 0, 255, 0.5)',
          },
        },
        'slow-fade': {
          'from': {
            opacity: '0',
            filter: 'blur(10px)',
          },
          'to': {
            opacity: '1',
            filter: 'blur(0)',
          },
        },
      },
    },
  },
  plugins: [],
}
