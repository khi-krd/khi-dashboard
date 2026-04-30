import {
  Noto_Naskh_Arabic as NotoNaskhArabic,
  Noto_Sans_Arabic as NotoSansArabic,
  Vazirmatn,
} from "next/font/google"

export const notoNaskhArabic = NotoNaskhArabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-naskh",
})

export const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-vazir",
})

export const notoSansArabic = NotoSansArabic({
  subsets: ["arabic"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-noto-arabic",
})
