/** Central CKB copy for the nav-menu module. */

export const NM = {
  dash: "—",
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.",
    validation: "تکایە بەشە پڕنەکراوەکان پڕ بکەرەوە.",
    retry: "دووبارە هەوڵبدەرەوە",
    duplicateKey: "ئەم کلیلە (itemKey) پێشتر بەکارهاتووە.",
    forbidden: "مۆڵەتت نییە بۆ ئەم کارە — تەنها بەڕێوەبەر دەتوانێت.",
    hrefRelative: "بەستەر دەبێت بە / دەست پێبکات، وەک /news",
    itemKeyFormat: "کلیل تەنها پیتی ئینگلیزی و ژمارە و - ڕێگەپێدراوە.",
    required: "ئەم بەشە پێویستە.",
  },
  page: {
    title: "مێنیوی ماڵپەڕ",
    subtitle:
      "مێنیوی هامبێرگەری ماڵپەڕ — ناونیشان، وەسف، وێنەی پشتەوە و بەستەرە لاوەکییەکان.",
    itemsTitle: "بڕگەکانی مێنیو",
    totalCount: (n: string) => `${n} بڕگە`,
    empty: "هیچ بڕگەیەک نییە. «بڕگەی نوێ» کلیک بکە بۆ زیادکردن.",
    itemLabel: (n: string) => `بڕگە ${n}`,
    newItem: "بڕگەی نوێ",
  },
  breadcrumb: {
    dashboard: "داشبۆرد",
    menu: "مێنیوی ماڵپەڕ",
  },
  action: {
    new: "بڕگەی نوێ",
    save: "پاشەکەوتکردن",
    saving: "پاشەکەوتکردن…",
    delete: "سڕینەوە",
    cancel: "هەڵوەشاندنەوە",
    expand: "کردنەوە",
    collapse: "داخستن",
    addLink: "زیادکردنی بەستەر",
    removeLink: "لابردنی بەستەر",
    moveUp: "بۆ سەرەوە",
    moveDown: "بۆ خوارەوە",
    discardDraft: "هەڵوەشاندنەوەی بڕگەی نوێ",
  },
  field: {
    itemKey: "کلیلی بڕگە (itemKey)",
    itemKeyHint:
      "دوای دروستکردن مەیگۆڕە — بەستەرە خۆکارەکانی ماڵپەڕ بەم کلیلەوە بەستراون.",
    itemKeyLocked: "کلیل قوفڵدراوە. بۆ گۆڕینی، بڕگەکە بسڕەوە و نوێ دروست بکە.",
    itemKeyPlaceholder: "news",
    labelCkb: "ناونیشان (سۆرانی)",
    labelKmr: "ناونیشان (کورمانجی)",
    descriptionCkb: "وەسف (سۆرانی)",
    descriptionKmr: "وەسف (کورمانجی)",
    href: "بەستەر",
    hrefPlaceholder: "/news",
    image: "وێنەی پشتەوە",
    imageHint:
      "ئەم وێنەیە تەواوی شاشە دادەپۆشێت — پێشنیاری پانی ٢٠٠٠px یان زیاتر.",
    displayOrder: "ڕیزبەندی",
    active: "چالاک",
    activeHint: "ناچالاک لە ماڵپەڕ نادەرکەوێت، بەڵام لێرە دەمێنێتەوە.",
  },
  links: {
    title: "بەستەرە لاوەکییەکان",
    empty: "هیچ بەستەرێکی لاوەکی نییە.",
    labelCkb: "ناونیشان (سۆرانی)",
    labelKmr: "ناونیشان (کورمانجی)",
    href: "بەستەر",
    hrefPlaceholder: "/news?category=culture",
    count: (n: string) => `${n} بەستەر`,
    overflowWarning: (max: string) =>
      `ماڵپەڕ تەنها ${max} بەستەری یەکەم پیشان دەدات.`,
    derivedHint:
      "بۆ ئەم بەشە، ماڵپەڕ بەستەرەکان بە خۆکاری لە بابەتەکانی سیستەمەوە دروست دەکات — ئەوەی لێرە دەینووسیت تەنها ئەگەر ئەو لیستە بەتاڵ بێت دەردەکەوێت.",
    ownSourceHint: "بۆ ئەم بەشە، ئەوەی لێرە دەینووسیت تاکە سەرچاوەیە.",
  },
  lang: {
    ckb: "سۆرانی",
    kmr: "کورمانجی",
  },
  dialog: {
    deleteTitle: "سڕینەوەی بڕگە",
    deleteBody:
      "ئەم بڕگەیە و هەموو بەستەرە لاوەکییەکانی دەسڕدرێنەوە. ناتوانرێت بگەڕێنرێتەوە.",
  },
  toast: {
    created: "بڕگە دروستکرا",
    saved: "گۆڕانکارییەکان پاشەکەوت کران",
    deleted: "بڕگە سڕایەوە",
  },
} as const

export function truncateLabel(value: string, max = 60): string {
  const t = value.trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}
