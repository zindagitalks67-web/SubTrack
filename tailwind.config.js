/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ✅ Ye add kiya hai
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#07070b',
        panel: '#0f0f17',
        'panel-2': '#161623',
        'panel-3': '#1d1d2e',
        brand: {
          purple: '#a855f7',
          blue: '#3b82f6',
          cyan: '#22d3ee',
          violet: '#8b5cf6',
        },
        content: {
          primary: '#f3f3f8',
          secondary: '#a6a6c2',
          muted: '#6c6c8a',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
        'brand-gradient-strong': 'linear-gradient(135deg, #8b5cf6 0%, #2563eb 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(59,130,246,0.18) 100%)',
        'glow-purple': 'radial-gradient(circle at center, rgba(168,85,247,0.35) 0%, rgba(168,85,247,0) 70%)',
        'glow-blue': 'radial-gradient(circle at center, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.45)',
        glow: '0 0 24px rgba(168,85,247,0.35)',
        'glow-blue': '0 0 24px rgba(59,130,246,0.3)',
        card: '0 4px 20px rgba(0,0,0,0.3)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(-20px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.16,1,0.3,1)',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.16,1,0.3,1)',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};