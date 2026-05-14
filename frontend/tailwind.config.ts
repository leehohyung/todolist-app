import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        sm: '375px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      colors: {
        bg: {
          primary:   '#ffffff',
          secondary: '#f8f9fa',
          card:      '#ffffff',
        },
        text: {
          primary:   '#1a1a2e',
          secondary: '#6b7280',
          muted:     '#9ca3af',
        },
        border: {
          DEFAULT: '#e5e7eb',
          focus:   '#3b82f6',
        },
        accent:  '#3b82f6',
        success: '#22c55e',
        danger:  '#ef4444',
        warning: '#f59e0b',
        cat: {
          blue:   '#93c5fd',
          green:  '#86efac',
          yellow: '#fde68a',
          purple: '#c4b5fd',
          pink:   '#f9a8d4',
          orange: '#fdba74',
          teal:   '#5eead4',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'sans-serif'],
      },
      fontSize: {
        xs:  ['12px', { lineHeight: '1.4' }],
        sm:  ['14px', { lineHeight: '1.5' }],
        md:  ['16px', { lineHeight: '1.6' }],
        lg:  ['18px', { lineHeight: '1.6' }],
        xl:  ['22px', { lineHeight: '1.4' }],
        '2xl': ['28px', { lineHeight: '1.3' }],
      },
      boxShadow: {
        sm:   '0 1px 3px rgba(0,0,0,0.08)',
        md:   '0 4px 12px rgba(0,0,0,0.10)',
        lg:   '0 8px 24px rgba(0,0,0,0.12)',
        card: '0 2px 8px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        full: '9999px',
      },
      transitionDuration: {
        fast:   '150ms',
        normal: '200ms',
        slow:   '300ms',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      animation: {
        'fade-in':  'fade-in 200ms ease-out',
        'slide-up': 'slide-up 250ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
