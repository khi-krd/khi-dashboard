import type { ManagedOptionKind } from "@/types/managed-option"

/** Shared CKB copy — same shape as BG so the management UI mirrors genres. */
export const MO = {
  dash: "—",
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.",
    validation: "تکایە بەشە هەڵەکان چاک بکەرەوە.",
    forbidden: "مۆڵەتت نییە بۆ ئەم کارە — تەنها بەڕێوەبەر دەتوانێت.",
    notFound: "نەدۆزرایەوە — لەوانەیە پێشتر سڕابێتەوە.",
    duplicateSlug: "ئەمە پێشتر هەیە — لە جیاتی دروستکردنی نوێ، ئەوەی هەیە دەستکاری بکە.",
    nameRequired: "لانیکەم یەکێک لە ناوەکان (سۆرانی یان کورمانجی) پێویستە.",
    tooLong: "زۆر درێژە.",
    reorderFailed: "ڕیزبەندییەکە بە تەواوی نەگۆڕا. دووبارە هەوڵبدەرەوە.",
  },
  action: {
    new: "نوێ",
    save: "پاشەکەوتکردن",
    saving: "پاشەکەوتکردن…",
    edit: "دەستکاری",
    delete: "سڕینەوە",
    cancel: "هەڵوەشاندنەوە",
    back: "گەڕانەوە",
    moveUp: "بۆ سەرەوە",
    moveDown: "بۆ خوارەوە",
    manage: "بەڕێوەبردن",
    clear: "لابردن",
  },
  field: {
    nameCkb: "ناو (سۆرانی)",
    nameKmr: "ناو (کورمانجی)",
    nameHint: "لانیکەم یەکێکیان پڕ بکەرەوە. گۆڕینی ناو لە هەموو شوێنێک دەگۆڕێت.",
    displayOrder: "Display Order",
    active: "چالاک",
    activeHint: "ناچالاک لە فۆرمەکاندا دەرناکەوێت، بەڵام کتێبە کۆنەکان دەمێننەوە.",
    inactive: "ناچالاک",
    bookCount: (n: string) => `${n} کتێب`,
    noBooks: "هیچ کتێبێک",
  },
  dialog: {
    deleteTitle: "سڕینەوە",
    deleteBody: (count: string) =>
      `ئەمە لە ${count} لادەبردرێت و ناگەڕێتەوە. ئەگەر تەنها دەتەوێت لە فۆرمەکان نەدەرکەوێت، لە جیاتی سڕینەوە ناچالاکی بکە.`,
    deleteBodyUnknown:
      "ئەمە لە هەموو کتێبێک لادەبردرێت کە هەیبووە و ناگەڕێتەوە. ئەگەر تەنها دەتەوێت لە فۆرمەکان نەدەرکەوێت، لە جیاتی سڕینەوە ناچالاکی بکە.",
  },
  toast: {
    created: "دروستکرا",
    saved: "گۆڕانکارییەکان پاشەکەوت کران",
    deleted: "سڕایەوە",
    reordered: "ڕیزبەندی نوێکرایەوە",
    activated: "چالاک کرا",
    deactivated: "ناچالاک کرا",
  },
} as const

/** Per-kind page copy. */
export const OPTION_PAGE: Record<
  ManagedOptionKind,
  { title: string; subtitle: string; tab: string; item: string }
> = {
  "writing-types": {
    title: "جۆری نووسین",
    subtitle: "کتێب، بەڵگەنامە، توێژینەوە، وتار — زیادکردن، ناونان، ڕیزکردن و شاردنەوە.",
    tab: "جۆری نووسین",
    item: "جۆر",
  },
  editions: {
    title: "چاپەکان",
    subtitle: "چاپی یەکەم، دووەم، سێیەم — کتێبە نوێکان بە شێوەی ئۆتۆماتیکی چاپی یەکەم دەگرن.",
    tab: "چاپ",
    item: "چاپ",
  },
  "book-languages": {
    title: "زمانی کتێب",
    subtitle: "جۆرە زمانی کوردییەکەی کتێبەکە — زیادکردن، دەستکاری و ڕیزکردن.",
    tab: "زمانی کتێب",
    item: "زمان",
  },
  "video-categories": {
    title: "پۆلەکانی ڤیدیۆ",
    subtitle: "فلیم، کلیپ، بەرنامەی کولتووری، بەڵگەیی — زیادکردن، دەستکاری و ڕیزکردن.",
    tab: "پۆلی ڤیدیۆ",
    item: "پۆل",
  },
}
