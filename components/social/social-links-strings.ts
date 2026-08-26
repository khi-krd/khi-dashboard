/** Central CKB copy for the social links module. */

export const SL = {
  dash: "—",
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.",
    validation: "تکایە بەشە هەڵەکان چاک بکەرەوە.",
    retry: "دووبارە هەوڵبدەرەوە",
    duplicatePlatform:
      "ئەم پلاتفۆرمە پێشتر بەستەری هەیە — لە جیاتی دروستکردنی نوێ، ئەوەی هەیە دەستکاری بکە.",
    forbidden: "مۆڵەتت نییە بۆ ئەم کارە — تەنها بەڕێوەبەر دەتوانێت.",
    notFound: "ئەم بەستەرە نەدۆزرایەوە — لەوانەیە پێشتر سڕابێتەوە.",
    urlAbsolute: "بەستەر دەبێت بە https:// دەست پێبکات.",
    platformFormat:
      "ناوی پلاتفۆرم تەنها پیتی ئینگلیزی، ژمارە، - و _ ڕێگەپێدراوە.",
    tooLong: "زۆر درێژە.",
  },
  page: {
    title: "لینکە کۆمەڵایەتییەکان",
    subtitle:
      "بەستەری فەیسبووک، ئینستاگرام، یوتیوب و واتساپ. لێرەوە دەیانگۆڕیت — پێویست بە گۆڕینی کۆد ناکات.",
    itemsTitle: "بەستەرەکان",
    totalCount: (n: string) => `${n} بەستەر`,
    empty: "هیچ بەستەرێک نییە. «بەستەری نوێ» کلیک بکە بۆ زیادکردن.",
    rowLabel: (n: string) => `بەستەر ${n}`,
  },
  breadcrumb: {
    dashboard: "داشبۆرد",
    social: "لینکە کۆمەڵایەتییەکان",
  },
  action: {
    new: "بەستەری نوێ",
    save: "پاشەکەوتکردن",
    saving: "پاشەکەوتکردن…",
    delete: "سڕینەوە",
    cancel: "هەڵوەشاندنەوە",
    open: "کردنەوەی بەستەر",
  },
  field: {
    platform: "پلاتفۆرم",
    platformPlaceholder: "پلاتفۆرمێک هەڵبژێرە",
    platformUsed: "بەستەری هەیە",
    url: "بەستەر",
    urlPlaceholder: "https://facebook.com/…",
    labelCkb: "ناونیشان (سۆرانی)",
    labelKmr: "ناونیشان (کورمانجی)",
    labelHint: "ئارەزوومەندانەیە — بەتاڵ بهێڵەرەوە ئەگەر پێویست نییە.",
    displayOrder: "ڕیزبەندی",
    displayOrderHint: "ژمارەی بچووکتر پێشتر دەردەکەوێت.",
    active: "چالاک",
    activeHint:
      "ناچالاک لە ماڵپەڕ نادەرکەوێت بەڵام لێرە دەمێنێتەوە — لە سڕینەوە باشترە.",
  },
  warn: {
    /** §7 rule 4 — an inactive row is hidden from the site, not secret. */
    publicRead:
      "خوێندنەوەی ئەم بەستەرانە بۆ هەمووانە، تەنانەت ئەوانەی ناچالاکن. هیچ بەستەرێکی تایبەت (واتساپی کەسی، بەستەری بەڕێوەبردن) لێرە دامەنێ.",
    /** §7 rule 2 — stored and returned, but the site has no icon for it yet. */
    notRendered:
      "ماڵپەڕ ئێستا تەنها فەیسبووک، ئینستاگرام، یوتیوب و واتساپ پیشان دەدات. ئەم پلاتفۆرمە پاشەکەوت دەکرێت، بەڵام لە ماڵپەڕ دەرناکەوێت.",
    /** §9 — the contact page reads the database, the footer still hard-codes. */
    footerPending:
      "پەڕەی پەیوەندی ئەم بەستەرانە بەکاردەهێنێت. خوارەوەی پەڕە (footer) هێشتا بەستەری کۆدکراو بەکاردەهێنێت.",
  },
  lang: {
    ckb: "سۆرانی",
    kmr: "کورمانجی",
  },
  dialog: {
    deleteTitle: "سڕینەوەی بەستەر",
    deleteBody:
      "ئەم بەستەرە بە تەواوی دەسڕدرێتەوە. ئەگەر تەنها دەتەوێت لە ماڵپەڕ بیشاریتەوە، لە جیاتی سڕینەوە ناچالاکی بکە.",
  },
  toast: {
    created: "بەستەر دروستکرا",
    saved: "گۆڕانکارییەکان پاشەکەوت کران",
    deleted: "بەستەر سڕایەوە",
  },
} as const

/** Display names for the platform picker; the stored key stays uppercase ASCII. */
export const PLATFORM_LABELS: Record<string, string> = {
  FACEBOOK: "فەیسبووک",
  INSTAGRAM: "ئینستاگرام",
  YOUTUBE: "یوتیوب",
  WHATSAPP: "واتساپ",
  TIKTOK: "تیکتۆک",
  TELEGRAM: "تێلێگرام",
  TWITTER: "تویتەر / X",
  LINKEDIN: "لینکدئین",
  SNAPCHAT: "سناپچات",
  THREADS: "تریدز",
  PINTEREST: "پینتەرێست",
  SOUNDCLOUD: "ساوندکلاود",
  SPOTIFY: "سپۆتیفای",
}

export function platformLabel(platform: string): string {
  const key = platform.trim().toUpperCase()
  return PLATFORM_LABELS[key] ?? key
}

/** Shown as the URL field's placeholder so the expected shape is obvious. */
export const PLATFORM_URL_HINTS: Record<string, string> = {
  FACEBOOK: "https://facebook.com/KurdishHeritage",
  INSTAGRAM: "https://instagram.com/KurdishHeritage",
  YOUTUBE: "https://youtube.com/@KurdishHeritage",
  WHATSAPP: "https://wa.me/9647500000000",
  TIKTOK: "https://tiktok.com/@KurdishHeritage",
  TELEGRAM: "https://t.me/KurdishHeritage",
  TWITTER: "https://x.com/KurdishHeritage",
  LINKEDIN: "https://linkedin.com/company/KurdishHeritage",
  SNAPCHAT: "https://snapchat.com/add/KurdishHeritage",
  THREADS: "https://threads.net/@KurdishHeritage",
  PINTEREST: "https://pinterest.com/KurdishHeritage",
  SOUNDCLOUD: "https://soundcloud.com/KurdishHeritage",
  SPOTIFY: "https://open.spotify.com/user/KurdishHeritage",
}

export function platformUrlHint(platform: string): string {
  const key = platform.trim().toUpperCase()
  return PLATFORM_URL_HINTS[key] ?? SL.field.urlPlaceholder
}

export function truncateLabel(value: string, max = 60): string {
  const t = value.trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}
