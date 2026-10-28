/** Shared strings for the localStorage draft layer and the drafts page. */
export const DRAFT_NS = {
  status: {
    saving: "پاشەکەوت دەکرێت…",
    saved: "پاشەکەوت کرا",
    restored: "پاشەکەوتەکە گەڕێندرایەوە",
    error: "نەتوانرا پاشەکەوتی بکەیت — دەستکارییەکانت پارێزراون",
  },
  toast: {
    restored: "ڕەشنووسی پێشوو گەڕێندرایەوە",
    discarded: "ڕەشنووسەکە سڕایەوە",
  },
  page: {
    title: "ڕەشنووسەکان",
    subtitle:
      "دەستکارییە پاشەکەوتنەکراوەکان کە بەشێوەی خودکار لەم وێبگەڕەدا پارێزراون — لە هەر کاتێک دەتوانیت بەردەوام بیت یان بیسڕیتەوە",
    empty: "هیچ ڕەشنووسێک نییە",
    new_record: "تۆماری نوێ",
    continue: "بەردەوامبوون",
    discard: "هەڵوەشاندنەوە",
    saved_at: "دوایین پاشەکەوت",
  },
} as const
