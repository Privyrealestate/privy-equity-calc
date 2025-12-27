/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        privy: {
          dominion: '#0A291E',
          ledger: '#F2F0EC',
          copper: '#B87D4B',
          vigilance: '#E04F39',
        }
      },
      fontFamily: {
        sans: ['var(--font-libre-franklin)'],
        serif: ['var(--font-crimson-pro)'],
        mono: ['var(--font-space-mono)'],
      },
    },
  },
  plugins: [],
};
