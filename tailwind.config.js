/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F0F10',
        foreground: '#F3F4F6',
        card: '#111214',
        'card-foreground': '#F3F4F6',
        popover: '#16171A',
        'popover-foreground': '#F3F4F6',
        primary: '#E50914',
        'primary-foreground': '#F3F4F6',
        secondary: '#FFD54A',
        'secondary-foreground': '#0F0F10',
        muted: '#A3A3AD',
        'muted-foreground': '#A3A3AD',
        accent: '#FFD54A',
        'accent-foreground': '#0F0F10',
        destructive: '#E50914',
        'destructive-foreground': '#F3F4F6',
        border: 'rgba(255, 255, 255, 0.08)',
        input: '#2A2A2D',
        ring: '#E50914',
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
      boxShadow: {
        'card': '0 8px 24px rgba(0, 0, 0, 0.35)',
        'card-hover': '0 12px 32px rgba(0, 0, 0, 0.45)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      aspectRatio: {
        '9/16': '9 / 16',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

