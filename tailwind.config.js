/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          cream: '#FBF7EE',
          sand: '#EAE3CA',
          forest: '#1F6F3A',
          pine: '#0C4A23',
          mint: '#10B981',
          emerald: '#059669',
          dark: '#14281D',
        },
        dark: {
          900: '#070b13',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
        },
      },
    },
  },
  plugins: [],
};
