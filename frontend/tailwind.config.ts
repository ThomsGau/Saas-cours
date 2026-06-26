import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        brand: {
          orange: "var(--brand-orange)",
          "orange-light": "var(--brand-orange-light)",
          brown: "var(--brand-brown)",
          "brown-dark": "var(--brand-brown-dark)",
          cream: "var(--brand-cream)",
          beige: "var(--brand-beige)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 1px 3px 0 oklch(0.35 0.02 55 / 0.06), 0 1px 2px -1px oklch(0.35 0.02 55 / 0.06)",
        "soft-lg":
          "0 4px 12px -2px oklch(0.35 0.02 55 / 0.08), 0 2px 6px -2px oklch(0.35 0.02 55 / 0.06)",
        "soft-xl":
          "0 8px 24px -4px oklch(0.35 0.02 55 / 0.1), 0 4px 8px -4px oklch(0.35 0.02 55 / 0.06)",
      },
      maxWidth: {
        page: "72rem",
        narrow: "28rem",
        wide: "80rem",
      },
    },
  },
  plugins: [],
};

export default config;
