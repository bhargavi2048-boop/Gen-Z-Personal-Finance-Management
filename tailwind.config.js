/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fintech: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // primary teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        brand: {
          dark: '#0B0F19', // deep premium dark
          cardDark: '#111827',
          cardSubtle: '#1F2937',
          borderDark: '#374151',
          accent: '#06B6D4',
          purple: '#8B5CF6',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.3)',
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
        'soft': '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
        'soft-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
