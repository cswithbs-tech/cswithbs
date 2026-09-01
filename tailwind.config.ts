import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            "h2, h3, h4": {
              "scroll-margin-top": "var(--scroll-mt)",
            },
          },
        },
      }),
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-lora)", "ui-serif", "Georgia"],
        mono: ["ui-monospace", "SFMono-Regular"],
        display: ["var(--font-space)", "var(--font-inter)"],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
