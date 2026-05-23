export const NS = {
  title: "دەربارەکان",
  subtitle: "بینین، گەڕان و بەڕێوەبردنی هەموو پەرەکانی دەربارە",
  count: (n: string) => `کۆی ${n} دەربارە`,
  new: "دەربارەی نوێ",
  search_placeholder: "گەڕان لە ناونیشان، ژێرناونیشان، یان سلەگ…",
  filter: {
    status_all: "هەموو دۆخەکان",
    active: "چالاک",
    inactive: "ناچالاک",
    lang_all: "هەموو زمانەکان",
    reset: "پاککردنەوە",
  },
  status: {
    active: "چالاک",
    inactive: "ناچالاک",
    active_helper: "پەرەکە لەسەر ماڵپەڕ بەردەستە.",
    inactive_helper: "پەرەکە لەسەر ماڵپەڕ دەردەکەوێت تەنها کاتێک چالاک بێت.",
  },
  lang: {
    ckb: "سۆرانی",
    kmr: "کورمانجی",
  },
  table: {
    id: "#",
    slugs: "سلەگەکان",
    title: "ناونیشان",
    language: "زمان",
    status: "دۆخ",
    date: "بەروار",
    actions: "",
  },
  slug: {
    missing: "سلەگ نییە",
    copy_title: "کلیک بکە بۆ لەبەرگرتنەوەی ناونیشانی URL",
  },
  pagination: {
    range: (from: string, to: string, total: string) =>
      `ڕیزی ${from}–${to} لە ${total}`,
  },
  action: {
    view: "بینین",
    edit: "دەستکاری",
    delete: "سڕینەوە",
    back: "گەڕانەوە",
    view_site: "بینین لە سایت",
    save: "پاشەکەوتکردن",
    saving: "پاشەکەوتکردن…",
    cancel: "هەڵوەشاندنەوە",
    copy_url: "لەبەرگرتنەوەی ناونیشانی URL",
  },
  breadcrumb: {
    dashboard: "داشبۆرد",
    about: "دەربارەکان",
    new: "دەربارەی نوێ",
    edit: "دەستکاری",
  },
  detail: {
    seo: "وەسفی میتا (SEO)",
  },
  sidebar: {
    visibility: "دەرکەوتن",
    slugs: "سلەگەکان",
    seo: "زانیاری SEO",
    seo_title: "ناونیشان",
    seo_desc: "وەسف",
    actions: "کردارەکان",
    completion: "تەواوبوون",
    completion_hint:
      "تەواو: ناونیشان، ژێرناونیشان، وەسفی SEO، ناوەرۆکی سەرەکی",
    languages: "زمانەکان",
    system: "زانیاری سیستەم",
    id: "ناسنامە",
    created: "دروستکراوە",
    updated: "نوێکراوەتەوە",
  },
  form: {
    slugs: "سلەگەکان",
    slug_ckb: "سلەگی سۆرانی",
    slug_kmr: "سلەگی کورمانجی",
    slug_ckb_hint: "ناسەری URL — کاراکتەری ASCII یان کوردی",
    slug_kmr_hint: "ئەگەر بۆشێت، سلەگی سۆرانی بەکاردێت",
    slug_required: "پێویستە",
    slug_optional: "ئیختیاری",
    title: "ناونیشان",
    subtitle: "ژێرناونیشان",
    seo: "وەسفی میتا (SEO)",
    seo_preview: "پێشبینین لە گووگل:",
    seo_fallback: "وەسفی پەرە لێرە دەردەکەوێت…",
    body: "ناوەرۆکی سەرەکی",
    dirty: "گۆڕانکارییە پاشەکەوتنەکراوەکان",
    clean: "هیچ گۆڕانکارییەک نییە",
  },
  validation: {
    languageRequired: "لانیکەم یەک زمان هەڵبژێرە",
    slugCkbRequired: "سلەگی سۆرانی پێویستە",
    titleCkbRequired: "ناونیشانی سۆرانی پێویستە",
    titleKmrRequired: "ناونیشانی کورمانجی پێویستە",
  },
  toast: {
    saved: "پاشەکەوت کرا",
    copied: "لینک لەبەرگرتەوە",
    deleted: "سڕایەوە",
    view_action: "بینین",
  },
  error: {
    validation: "تکایە هەڵەکان چاک بکە",
    load: "بارکردن سەرکەوتوو نەبوو",
    retry: "دووبارە هەوڵبدەرەوە",
  },
  not_found: {
    title: "پەرەکە نەدۆزرایەوە",
    cta: "گەڕانەوە بۆ لیست",
  },
  delete: {
    title: "سڕینەوەی پەرەی دەربارە",
    description: (name: string) =>
      `دڵنیایت لە سڕینەوەی «${name}»؟ ئەم کردارە ناگەڕێتەوە.`,
    confirm: "دڵنیام",
    cancel: "هەڵوەشاندنەوە",
  },
} as const

export function truncateTitle(s: string, max = 48) {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}
