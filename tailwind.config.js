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
        ocean: {
          950: '#030a14',
          900: '#071526',
          850: '#0c203b',
          800: '#0f294a',
          700: '#173f6f',
          600: '#205594',
          500: '#2d74c4',
          400: '#489af4',
          300: '#7cb5f8',
          200: '#b0d4fc',
          100: '#dbeafe',
        },
        cyan: {
          electric: '#00f2fe',
          glow: '#4facfe',
        },
        marine: {
          gold: '#f59e0b',
          warning: '#fbbf24',
          danger: '#ef4444',
          success: '#10b981',
          teal: '#14b8a6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 3s ease-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(0, 242, 254, 0.7))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 5px rgba(0, 242, 254, 0.3))' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
