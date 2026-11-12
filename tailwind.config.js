/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'ui-sans-serif', 'sans-serif'],
        plate: ['"Barlow Condensed"', 'monospace', 'sans-serif'],
      },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          soft: "var(--primary-soft)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          soft: "var(--destructive-soft)",
          foreground: "var(--destructive-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          text: "var(--warning-text)",
          soft: "var(--warning-soft)",
        },
        status: {
          pending: {
            DEFAULT: "var(--status-pending)",
            soft: "var(--status-pending-soft)",
            text: "var(--status-pending-text)",
          },
          progress: {
            DEFAULT: "var(--status-progress)",
            soft: "var(--status-progress-soft)",
            text: "var(--status-progress-text)",
          },
          completed: {
            DEFAULT: "var(--status-completed)",
            soft: "var(--status-completed-soft)",
            text: "var(--status-completed-text)",
          },
          delivered: {
            DEFAULT: "var(--status-delivered)",
            soft: "var(--status-delivered-soft)",
            text: "var(--status-delivered-text)",
          },
        },
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0, 0, 0, 0.08)",
        modal: "0 8px 30px rgba(0, 0, 0, 0.16)",
      },
    },
  },
  plugins: [],
}
