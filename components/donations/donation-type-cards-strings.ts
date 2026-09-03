/** Central CKB copy for the donation type cards module. */

export const DTC = {
  dash: "—",
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.",
    validation: "تکایە بەشە هەڵەکان چاک بکەرەوە.",
    retry: "دووبارە هەوڵبدەرەوە",
    forbidden: "مۆڵەتت نییە بۆ ئەم کارە — تەنها بەڕێوەبەر دەتوانێت.",
    notFound: "ئەم کارتە نەدۆزرایەوە — لەوانەیە پێشتر سڕابێتەوە.",
    titleRequired:
      "لانیکەم یەکێک لە ناونیشانەکان (سۆرانی یان کورمانجی) پێویستە پڕ بکرێتەوە.",
    imageRequired: "کارت بەبێ وێنە پاشەکەوت ناکرێت — وێنەیەک هەڵبژێرە.",
    imageUrlFormat: "بەستەری وێنە دەبێت بە https:// یان / دەست پێبکات.",
    tooLong: "زۆر درێژە.",
    reorderFailed:
      "ڕیزبەندییەکە بە تەواوی نەگۆڕا. لیستەکە نوێکرایەوە — دووبارە هەوڵبدەرەوە.",
  },
  page: {
    title: "کارتەکانی بەخشین",
    subtitle:
      "کارتەکانی بەشی «دەتوانم چی ببەخشم؟» لە پەڕەی بەخشین. لێرەوە زیاد دەکەیت، ڕیز دەکەیت و دەیانشاریتەوە.",
    itemsTitle: "کارتەکان",
    totalCount: (n: string) => `${n} کارت`,
    empty: "هیچ کارتێک نییە. «کارتی نوێ» کلیک بکە بۆ زیادکردن.",
    rowLabel: (n: string) => `کارتی ${n}`,
  },
  breadcrumb: {
    dashboard: "داشبۆرد",
    donations: "بەخشین",
    typeCards: "کارتەکانی بەخشین",
  },
  action: {
    new: "کارتی نوێ",
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
    image: "وێنەی کارت",
  },
  field: {
    titleCkb: "ناونیشان (سۆرانی)",
    titleKmr: "ناونیشان (کورمانجی)",
    titleHint:
      "لانیکەم یەکێکیان پڕ بکەرەوە — ماڵپەڕ ئەوەی هەیە پیشان دەدات.",
    descriptionCkb: "پێناسە (سۆرانی)",
    descriptionKmr: "پێناسە (کورمانجی)",
    descriptionHint:
      "پیشان دەدرێت تەنیا لەسەر کارتی یەکەم (کارتی گەورە). بۆ کارتەکانی تر تەنها ناونیشان دەردەکەوێت.",
    image: "وێنە",
    imageHint:
      "وێنەکە وەک پاشبنەما بەکاردێت — ماڵپەڕ تاریکی دەکات و نووسینی سپی لەسەری دادەنێت. وێنەی ڕەنگاوڕەنگ یان ڕووناک کێشەی نییە، بەڵام ڕووی مرۆڤ لە خوارەوەی وێنەکەدا دامەنێ، چونکە ناونیشان لە سێیەکی خوارەوەدا دادەنیشێت.",
    imageDropHint: "وێنەیەک ڕاکێشە یان «بارکردن» کلیک بکە.",
    displayOrder: "ڕیزبەندی",
    active: "چالاک",
    activeHint:
      "ناچالاک لە ماڵپەڕ نادەرکەوێت بەڵام لێرە دەمێنێتەوە — لە سڕینەوە باشترە.",
    inactive: "ناچالاک",
  },
  featured: {
    badge: "کارتی گەورە",
    /** The one design rule this screen exists to make visible. */
    explainer:
      "کارتی سەرەوەی لیست لە ماڵپەڕدا وەک کارتی گەورە دەردەکەوێت و تەنها ئەوە پێناسەکەی پیشان دەدرێت. ئەوانی تر کارتی بچووکن و تەنها ناونیشانیان دەبینرێت. ژمارەکانی سەر ماڵپەڕ («٠١»، «٠٢»…) لە شوێنی خۆیانەوە دێن — دەستکارییان ناکەیت.",
    missingDescription:
      "کارتی گەورەیە بەڵام پێناسەی نییە — لە ماڵپەڕدا بەشی نووسینەکەی بەتاڵ دەبێت.",
  },
  dialog: {
    createTitle: "کارتی نوێ",
    editTitle: "دەستکاری کارت",
    description:
      "ناونیشان، پێناسە و وێنەی کارتەکە. پێناسە تەنها لەسەر کارتی یەکەم دەردەکەوێت.",
    deleteTitle: "سڕینەوەی کارت",
    deleteBody:
      "ئەم کارتە بە تەواوی دەسڕدرێتەوە. ئەگەر تەنها دەتەوێت لە ماڵپەڕ بیشاریتەوە، لە جیاتی سڕینەوە ناچالاکی بکە.",
  },
  toast: {
    created: "کارت دروستکرا",
    saved: "گۆڕانکارییەکان پاشەکەوت کران",
    deleted: "کارت سڕایەوە",
    reordered: "ڕیزبەندی نوێکرایەوە",
    activated: "کارت چالاک کرا",
    deactivated: "کارت ناچالاک کرا",
  },
} as const

/** The row's headline — Sorani first, Kurmanji as the fallback. */
export function donationTypeCardTitle(card: {
  titleCkb: string | null
  titleKmr: string | null
}): string {
  return card.titleCkb?.trim() || card.titleKmr?.trim() || DTC.dash
}

export function truncateLabel(value: string, max = 60): string {
  const t = value.trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}
