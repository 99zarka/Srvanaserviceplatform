/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Service Platform Colors
        primary: {
          DEFAULT: '#1A2B4C', // Dark blue - main brand color
          50: '#E8EBF0',
          100: '#C5CED9',
          200: '#9FAEC2',
          300: '#798EAB',
          400: '#5A7394',
          500: '#1A2B4C', // Base
          600: '#152341',
          700: '#101B35',
          800: '#0C132A',
          900: '#070C1E',
        },
        accent: {
          DEFAULT: '#F4C430', // Gold/Yellow - highlight color
          50: '#FFFBEE',
          100: '#FEF5D4',
          200: '#FDEAA9',
          300: '#FCDF7E',
          400: '#FBD553',
          500: '#F4C430', // Base
          600: '#E0A814',
          700: '#B8870F',
          800: '#8F670B',
          900: '#664707',
        },
        neutral: {
          50: '#F8F9FA',   // Very light gray - backgrounds
          100: '#F1F3F5',  // Light gray - secondary backgrounds
          200: '#E9ECEF',  // Border color
          300: '#DEE2E6',  // Subtle borders
          400: '#CED4DA',  // Disabled states
          500: '#ADB5BD',  // Muted text
          600: '#6C757D',  // Secondary text
          700: '#495057',  // Body text
          800: '#343A40',  // Headings
          900: '#212529',  // Dark text
        },
        success: '#28A745',  // Green for completed/success states
        warning: '#FFC107',  // Amber for warnings
        danger: '#DC3545',   // Red for errors/critical
        info: '#17A2B8',     // Cyan for info states
      },
      fontFamily: {
        sans: ['Noto Kufi Arabic', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        arabic: ['Noto Kufi Arabic', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'zoom-in': 'zoomIn 0.4s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'bell-ring': 'bellRing 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bellRing: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '10%, 30%': { transform: 'rotate(-10deg)' },
          '20%, 40%': { transform: 'rotate(10deg)' },
          '50%': { transform: 'rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
