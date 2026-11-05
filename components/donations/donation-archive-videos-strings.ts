/** Central CKB copy for the donation archive videos module. */

export const DAV = {
  dash: "—",
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.",
    validation: "تکایە بەشە هەڵەکان چاک بکەرەوە.",
    retry: "دووبارە هەوڵبدەرەوە",
    forbidden: "مۆڵەتت نییە بۆ ئەم کارە — تەنها بەڕێوەبەر دەتوانێت.",
    notFound: "ئەم ڤیدیۆیە نەدۆزرایەوە — لەوانەیە پێشتر سڕابێتەوە.",
    titleRequired:
      "لانیکەم یەکێک لە ناونیشانەکان (سۆرانی یان کورمانجی) پێویستە پڕ بکرێتەوە.",
    videoRequired:
      "ڤیدیۆ بەبێ کلیپ پاشەکەوت ناکرێت — ڤیدیۆیەک باربکە یان بەستەری یوتیوب دابنێ.",
    videoUrlFormat:
      "بەستەری ڤیدیۆ دەبێت بە https:// یان / دەست پێبکات — بەستەری یوتیوبیش دەبێت.",
    posterUrlFormat: "بەستەری وێنە دەبێت بە https:// یان / دەست پێبکات.",
    tooLong: "زۆر درێژە.",
    reorderFailed:
      "ڕیزبەندییەکە بە تەواوی نەگۆڕا. لیستەکە نوێکرایەوە — دووبارە هەوڵبدەرەوە.",
  },
  page: {
    title: "ڤیدیۆکانی بەخشەرانی ئەرشیف",
    subtitle:
      "کلیپەکانی ئەو کەسانەی ئەرشیفەکەیان بۆ ئینستیتووت هێناوە — لە پەڕەی بەخشین لەنێوان کارتەکان و نووسینی کۆتایی دەردەکەون.",
    itemsTitle: "ڤیدیۆکان",
    totalCount: (n: string) => `${n} ڤیدیۆ`,
    empty: "هیچ ڤیدیۆیەک نییە. «ڤیدیۆی نوێ» کلیک بکە بۆ زیادکردن.",
    rowLabel: (n: string) => `ڤیدیۆی ${n}`,
  },
  breadcrumb: {
    dashboard: "داشبۆرد",
    donations: "بەخشین",
    archiveVideos: "ڤیدیۆکانی بەخشەران",
  },
  action: {
    new: "ڤیدیۆی نوێ",
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
    video: "ڤیدیۆکە",
    poster: "وێنەی سەرڤەقە (ئاپشنال)",
  },
  field: {
    titleCkb: "ناونیشان (سۆرانی)",
    titleKmr: "ناونیشان (کورمانجی)",
    titleHint:
      "لانیکەم یەکێکیان پڕ بکەرەوە — زۆرجار ناوی کەسەکە یان ئەرشیفەکەیە. ماڵپەڕ ئەوەی هەیە پیشان دەدات.",
    descriptionCkb: "پێناسە (سۆرانی)",
    descriptionKmr: "پێناسە (کورمانجی)",
    descriptionHint:
      "دێڕێکی کورت لەژێر ناونیشان — بۆ نموونە چیرۆکی ئەرشیفەکە یان شوێنەکە. ئاپشنالە.",
    videoHint:
      "ڤیدیۆیەکە باربکە یان بەستەری یوتیوب دابنێ — هەردووکیان لێدەدرێن. ئەمە پێویستە.",
    videoDropHint: "ڤیدیۆیەک ڕاکێشە یان «بارکردن» کلیک بکە.",
    posterHint:
      "وێنەیەک پیشان دەدرێت پێش لێدان — ئەگەر بەتاڵ بێت یوتیوب/ڤیدیۆکە خۆی دێخەیت.",
    posterDropHint: "وێنەیەک ڕاکێشە یان «بارکردن» کلیک بکە.",
    displayOrder: "ڕیزبەندی",
    active: "چالاک",
    activeHint:
      "ناچالاک لە ماڵپەڕ نادەرکەوێت بەڵام لێرە دەمێنێتەوە — لە سڕینەوە باشترە.",
    inactive: "ناچالاک",
    youtube: "یوتیوب",
    file: "فایل",
  },
  order: {
    badge: "یەکەم",
    explainer:
      "ڕیزبەندی لێرە هەمان ڕیزبەندییە لە ماڵپەڕ — یەکەم ڤیدیۆ یەکەم دەردەکەوێت. ئەستانەگۆڕانەوەکان بەکەیس دەنێرێن بۆ هەمان لاینی کارتەکان.",
  },
  dialog: {
    createTitle: "ڤیدیۆی نوێ",
    editTitle: "دەستکاری ڤیدیۆ",
    description:
      "ناونیشان، پێناسە و کلیپەکە. ڤیدیۆ دەتوانێت فایلێکی بارکراو بێت یان بەستەری یوتیوب.",
    deleteTitle: "سڕینەوەی ڤیدیۆ",
    deleteBody:
      "ئەم ڤیدیۆیە بە تەواوی دەسڕدرێتەوە. ئەگەر تەنها دەتەوێت لە ماڵپەڕ بیشاریتەوە، لە جیاتی سڕینەوە ناچالاکی بکە.",
  },
  toast: {
    created: "ڤیدیۆ دروستکرا",
    saved: "گۆڕانکارییەکان پاشەکەوت کران",
    deleted: "ڤیدیۆ سڕایەوە",
    reordered: "ڕیزبەندی نوێکرایەوە",
    activated: "ڤیدیۆ چالاک کرا",
    deactivated: "ڤیدیۆ ناچالاک کرا",
  },
} as const

/** The row's headline — Sorani first, Kurmanji as the fallback. */
export function donationArchiveVideoTitle(video: {
  titleCkb: string | null
  titleKmr: string | null
}): string {
  return video.titleCkb?.trim() || video.titleKmr?.trim() || DAV.dash
}

export function truncateLabel(value: string, max = 60): string {
  const t = value.trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}
