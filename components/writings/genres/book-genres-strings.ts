/**
 * Central CKB copy for the book genres module.
 *
 * Kept out of `writings-strings.ts` on purpose: that file already exports
 * `NS.genre`, which is the *family grouping* of the built-in genres, and
 * hanging a second, unrelated `genres` key off the same object made every call
 * site ambiguous at a glance.
 */

export const BG = {
  dash: "—",
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.",
    validation: "تکایە بەشە هەڵەکان چاک بکەرەوە.",
    retry: "دووبارە هەوڵبدەرەوە",
    forbidden: "مۆڵەتت نییە بۆ ئەم کارە — تەنها بەڕێوەبەر دەتوانێت.",
    notFound: "ئەم جۆرە نەدۆزرایەوە — لەوانەیە پێشتر سڕابێتەوە.",
    /** 409 — the slug column is unique. */
    duplicateSlug:
      "ئەم جۆرە پێشتر هەیە — لە جیاتی دروستکردنی نوێ، ئەوەی هەیە دەستکاری بکە.",
    /** 400 — a stale client sent a changed slug for a genre books already use. */
    slugImmutable:
      "کۆدی جۆر ناگۆڕدرێت دوای دروستکردن. پەڕەکە نوێ بکەرەوە و دووبارە هەوڵبدەرەوە.",
    slugFormat:
      "کۆدی جۆر تەنها پیتی ئینگلیزی، ژمارە و _ ڕێگەپێدراوە، و دەبێت بە پیت یان ژمارە دەست پێبکات.",
    slugRequired: "کۆدی جۆر پێویستە.",
    nameRequired: "لانیکەم یەکێک لە ناوەکان (سۆرانی یان کورمانجی) پێویستە.",
    tooLong: "زۆر درێژە.",
    reorderFailed:
      "ڕیزبەندییەکە بە تەواوی نەگۆڕا. لیستەکە نوێکرایەوە — دووبارە هەوڵبدەرەوە.",
  },
  page: {
    title: "جۆرەکانی کتێب",
    subtitle:
      "جۆرەکانی کتێب لێرەوە بەڕێوە دەبرێن. زیادکردن، ناونان، ڕیزکردن و شاردنەوە — پێویست بە گۆڕینی کۆد ناکات.",
    itemsTitle: "جۆرەکان",
    totalCount: (n: string) => `${n} جۆر`,
    empty: "هیچ جۆرێک نییە. «جۆری نوێ» کلیک بکە بۆ زیادکردن.",
    rowLabel: (n: string) => `جۆری ${n}`,
  },
  breadcrumb: {
    dashboard: "داشبۆرد",
    writings: "نووسراوەکان",
    genres: "جۆرەکانی کتێب",
  },
  action: {
    new: "جۆری نوێ",
    save: "پاشەکەوتکردن",
    saving: "پاشەکەوتکردن…",
    edit: "دەستکاری",
    delete: "سڕینەوە",
    cancel: "هەڵوەشاندنەوە",
    back: "گەڕانەوە",
    moveUp: "بۆ سەرەوە",
    moveDown: "بۆ خوارەوە",
    link: "بەڕێوەبردنی جۆرەکان",
  },
  field: {
    slug: "کۆدی جۆر",
    slugHint:
      "کۆدێکی ئینگلیزی بە پیتی گەورە — بۆ نموونە NOVEL. لە بەستەرەکاندا بەکاردێت.",
    slugLocked: "ناتوانرێت بگۆڕدرێت — لە بەستەرەکاندا بەکارهاتووە",
    slugSuggested: "لە ناوی کورمانجییەوە پێشنیار کرا",
    nameCkb: "ناو (سۆرانی)",
    nameKmr: "ناو (کورمانجی)",
    nameHint:
      "لانیکەم یەکێکیان پڕ بکەرەوە. گۆڕینی ناو لە هەموو شوێنێک دەگۆڕێت، لە هەمان کاتدا.",
    displayOrder: "ڕیزبەندی",
    active: "چالاک",
    activeHint:
      "ناچالاک لە فۆرمی کتێب دەرناکەوێت، بەڵام کتێبە کۆنەکان جۆرەکەیان دەمێنێتەوە.",
    inactive: "ناچالاک",
    bookCount: (n: string) => `${n} کتێب`,
    noBooks: "هیچ کتێبێک",
  },
  hint: {
    /** The three verbs, said once at the top of the screen. */
    verbs:
      "بۆ ڕاستکردنەوەی ناو: «دەستکاری». بۆ لابردنی جۆرێک بەبێ دەستکاریکردنی کتێبە کۆنەکان: «چالاک» بکوژێنەوە. سڕینەوە تەنها بۆ جۆرێکە بە هەڵە دروستکرابێت — لە هەموو کتێبێک لادەبردرێت و ناگەڕێتەوە.",
    /** Backend guide note: the website still renders its own fixed list. */
    websitePending:
      "ماڵپەڕ هێشتا لیستی خۆی بەکاردەهێنێت. جۆرێکی نوێ لێرە و لە فۆرمی کتێبدا کاردەکات، بەڵام هێشتا لەسەر ماڵپەڕ دەرناکەوێت — ئەمە چاوەڕوانکراوە.",
  },
  /** Copy for the genre picker inside the book form. */
  form: {
    loading: "جۆرەکان دەهێنرێن…",
    /**
     * Shown when the genres endpoint is unavailable — the picker falls back to
     * the list compiled into this build so the book form keeps working.
     */
    fallbackNotice:
      "لیستی جۆرەکان نەهێنرا، بۆیە لیستی ناوەکی بەکاردەهێنرێت. دەتوانیت کتێبەکە پاشەکەوت بکەیت، بەڵام جۆرە نوێیەکان لێرە دەرناکەون.",
    empty:
      "هیچ جۆرێکی چالاک نییە. لە «جۆرەکانی کتێب»ەوە جۆرێک زیاد بکە.",
    manageLink: "بەڕێوەبردنی جۆرەکان",
    /** Genres already on the book that the active list no longer offers. */
    attachedTitle: "لەسەر ئەم کتێبە، بەڵام لە لیستدا نییە",
    attachedHint:
      "ئەمانە پێشتر بۆ ئەم کتێبە دانراون و دەمێننەوە. دەتوانیت لایان ببەیت، بەڵام دووبارە زیاد ناکرێنەوە.",
  },
  dialog: {
    createTitle: "جۆری نوێ",
    editTitle: "دەستکاری جۆر",
    description: "ناوی جۆرەکە و کۆدەکەی. کۆد دوای پاشەکەوتکردن ناگۆڕدرێت.",
    deleteTitle: "سڕینەوەی جۆر",
    deleteBody: (count: string) =>
      `ئەم جۆرە لە ${count} لادەبردرێت. ناگەڕێتەوە. ئەگەر تەنها دەتەوێت لە فۆرمی کتێب نەدەرکەوێت، لە جیاتی سڕینەوە ناچالاکی بکە.`,
    deleteBodyUnknown:
      "ئەم جۆرە لە هەموو کتێبێک لادەبردرێت کە هەیبووە. ناگەڕێتەوە. ئەگەر تەنها دەتەوێت لە فۆرمی کتێب نەدەرکەوێت، لە جیاتی سڕینەوە ناچالاکی بکە.",
  },
  toast: {
    created: "جۆر دروستکرا",
    saved: "گۆڕانکارییەکان پاشەکەوت کران",
    deleted: "جۆر سڕایەوە",
    reordered: "ڕیزبەندی نوێکرایەوە",
    activated: "جۆر چالاک کرا",
    deactivated: "جۆر ناچالاک کرا",
  },
} as const
