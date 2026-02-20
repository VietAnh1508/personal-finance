import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#f5f4ef',
          ink: '#1f2937',
          accent: '#b45309',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
