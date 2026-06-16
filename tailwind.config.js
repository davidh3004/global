/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#2D8C4E',
          dark: '#1F6B3A',
          light: '#3BAE62',
          pale: '#EAF6EE',
        },
        teal: '#3AAFA9',
        red: '#C0392B',
        gray: {
          50: '#F9FAF9',
          100: '#F0F4F1',
          200: '#DDE5DF',
          300: '#C2CFC4',
          400: '#8EA191',
          600: '#4A5E50',
          800: '#1E2B22',
          900: '#0F1A12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ['light'],
    base: true,
    styled: true,
    utils: true,
  },
}
