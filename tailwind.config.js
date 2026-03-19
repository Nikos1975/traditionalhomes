/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'header-bg': '#FFFFFF',
        'header-border': '#E6E1D8',
        'body-bg': '#F7F4EE',
        'body-text': '#2C2419',
        'muted': '#6B5F50',
        
        // Primary (Role: MAIN ACTION - Terracotta)
        'primary': '#B44B2A',
        'primary-hover': '#9A3F23',

        // Accent (Role: LIMITED USE - Muted Blue)
        'accent-blue': '#0880A8',

        // UI
        'footer-bg': '#0F2A33',
        'footer-text': '#C8D8DD',
        
        // Base Stone scale
        'stone-100': '#F7F4EE',
        'stone-200': '#EEE9DF',
        'stone-300': '#E6E1D8',
        'stone-400': '#C8BFB0',
        'stone-500': '#9A8F7E',
        'stone-600': '#6B5F50',
        'stone-700': '#453A2D',
        'stone-800': '#2C2419',

        // State
        'success': '#2D6A4F',
        'warning': '#B45309',
        'error': '#AC0814',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        site: '1280px',
      },
      boxShadow: {
        header: '0 1px 0 0 #E6E1D8',
        card: '0 2px 12px 0 rgba(44,36,25,0.08)',
        'card-hover': '0 8px 28px 0 rgba(44,36,25,0.14)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};