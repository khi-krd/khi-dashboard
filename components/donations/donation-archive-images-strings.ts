/** Central CKB copy for the donation archive images module. */

export const DAI = {
  dash: "—",
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.",
    validation: "تکایە بەشە هەڵەکان چاک بکەرەوە.",
    retry: "دووبارە هەوڵبدەرەوە",
    forbidden: "مۆڵەتت نییە بۆ ئەم کارە — تەنها بەڕێوەبەر دەتوانێت.",
    notFound: "ئەم وێنەیە نەدۆزرایەوە — لەوانەیە پێشتر سڕابێتەوە.",
    titleRequired:
      "لانیکەم یەکێک لە ناونیشانەکان (سۆرانی یان کورمانجی) پێویستە پڕ بکرێتەوە.",
    imageRequired: "وێنە بەبێ فایل پاشەکەوت ناکرێت — وێنەیەک باربکە.",
    imageUrlFormat: "بەستەری وێنە دەبێت بە https:// یان / دەست پێبکات.",
    tooLong: "زۆر درێژە.",
    reorderFailed:
      "ڕیزبەندییەکە بە تەواوی نەگۆڕا. لیستەکە نوێکرایەوە — دووبارە هەوڵبدەرەوە.",
  },
  page: {
    title: "وێنەکانی بەخشەرانی ئەرشیف",
    subtitle:
      "وێنەکانی ئەو کەسانەی ئەرشیفەکەیان بۆ ئینستیتووت هێناوە — لە پەڕەی بەخشین وەک فان دەردەکەون.",
    itemsTitle: "وێنەکان",
    totalCount: (n: string) => `${n} وێنە`,
    empty: "هیچ وێنەیەک نییە. «وێنەی نوێ» کلیک بکە بۆ زیادکردن.",
    rowLabel: (n: string) => `وێنەی ${n}`,
  },
  breadcrumb: {
    dashboard: "داشبۆرد",
    donations: "بەخشین",
    archiveImages: "وێنەکانی بەخشەران",
  },
  action: {
    new: "وێنەی نوێ",
    save: "پاشەکەوتکردن",
    saving: "پاشەکەوتکردن…",
    edit: "دەستکاری",
    delete: "سڕینەوە",
    cancel: "هەڵوەشاندنەوە",
    moveUp: "بۆ سەرەوە",
    moveDown: "بۆ خوارەوە",
  },
  section: {
    titles: "ناونیشانەکان",
    descriptions: "پێناسەکان",
    image: "وێنەکە",
  },
  field: {
    titleCkb: "ناونیشان (سۆرانی)",
    titleKmr: "ناونیشان (کورمانجی)",
    titleHint:
      "لانیکەم یەکێکیان پڕ بکەرەوە — زۆرجار ناوی کەسەکە یان ئەرشیفەکەیە. ماڵپەڕ ئەوەی هەیە پیشان دەدات.",
    descriptionCkb: "پێناسە (سۆرانی)",
    descriptionKmr: "پێناسە (کورمانجی)",
    descriptionHint:
      "دێڕێکی کورت لەژێر ناونیشان — بۆ نموونە چیرۆکی وێنەکە یان شوێنەکە. ئاپشنالە.",
    imageHint: "وێنەیەک باربکە — ئەمە پێویستە.",
    imageDropHint: "وێنەیەک ڕاکێشە یان «بارکردن» کلیک بکە.",
    displayOrder: "ڕیزبەندی",
    active: "چالاک",
    activeHint:
      "ناچالاک لە ماڵپەڕ نادەرکەوێت بەڵام لێرە دەمێنێتەوە — لە سڕینەوە باشترە.",
    inactive: "ناچالاک",
  },
  order: {
    explainer:
      "ڕیزبەندی لێرە هەمان ڕیزبەندییە لە ماڵپەڕ — یەکەم وێنە یەکەم دەردەکەوێت.",
  },
  dialog: {
    createTitle: "وێنەی نوێ",
    editTitle: "دەستکاری وێنە",
    description: "ناونیشان، پێناسە و وێنەکە.",
    deleteTitle: "سڕینەوەی وێنە",
    deleteBody:
      "ئەم وێنەیە بە تەواوی دەسڕدرێتەوە. ئەگەر تەنها دەتەوێت لە ماڵپەڕ بیشاریتەوە، لە جیاتی سڕینەوە ناچالاکی بکە.",
  },
  toast: {
    created: "وێنە دروستکرا",
    saved: "گۆڕانکارییەکان پاشەکەوت کران",
    deleted: "وێنە سڕایەوە",
    reordered: "ڕیزبەندی نوێکرایەوە",
    activated: "وێنە چالاک کرا",
    deactivated: "وێنە ناچالاک کرا",
  },
} as const

/** The row's headline — Sorani first, Kurmanji as the fallback. */
export function donationArchiveImageTitle(image: {
  titleCkb: string | null
  titleKmr: string | null
}): string {
  return image.titleCkb?.trim() || image.titleKmr?.trim() || DAI.dash
}

export function truncateLabel(value: string, max = 60): string {
  const t = value.trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}
