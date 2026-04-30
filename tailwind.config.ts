import type { Config } from "tailwindcss"

const config = {
  theme: {
    extend: {
      fontFamily: {
        naskh: ["var(--font-naskh)"],
        vazir: ["var(--font-vazir)"],
        "noto-arabic": ["var(--font-noto-arabic)"],
      },
    },
  },
} satisfies Config

export default config
