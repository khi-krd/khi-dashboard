/**
 * Sorani strings for the API-error layer (`lib/api-error.ts` classifier +
 * `toastApiError` in lib/toast.ts). Each category carries a short title for
 * the toast heading and a one-line hint telling the editor what to do next.
 * Phrasing mirrors the existing toast vocabulary in lib/toast.ts.
 */
export const ERROR_NS = {
  network: {
    title: "کێشەی پەیوەندی",
    hint: "کارەکانت پارێزراون — تکایە دووبارە هەوڵبدەرەوە",
  },
  timeout: {
    title: "داواکارییەکە زۆر درێژی کشا",
    hint: "سێرڤەر وەڵام نەدایەوە — تکایە دووبارە هەوڵبدەرەوە",
  },
  auth: {
    title: "کاتی دانیشتن تەواو بوو",
    hint: "تکایە دووبارە بچووژووەوە",
  },
  forbidden: {
    title: "ڕێگەپێنەدراوە",
    hint: "مۆڵەتی ئەم کردارەت نییە",
  },
  "not-found": {
    title: "نەدۆزرایەوە",
    hint: "تۆمارەکە بوونی نییە یان سڕاوەتەوە",
  },
  conflict: {
    title: "هەمان تۆمار پێشتر هەیە",
    hint: "بەها جیاوازێک هەڵبژێرە و دووبارە هەوڵبدەرەوە",
  },
  "too-large": {
    title: "فایلەکە زۆر گەورەیە",
    hint: "قەبارەکە لە سنووری سێرڤەر تێدەپەڕێت — فایلێکی بچووکتڕ هەڵبژێرە",
  },
  "media-type": {
    title: "جۆری ناوەڕۆک پشتگیری ناکرێت",
    hint: "فۆرماتی نێردراوەکە لەگەڵ ئەم ئامرازە ناگونجێت",
  },
  validation: {
    title: "هەڵەی پشکنین",
    hint: "خانە نیشانەکراوەکان چاک بکە و دووبارە هەوڵبدەرەوە",
  },
  "rate-limit": {
    title: "داواکارییەکان زۆر بوون",
    hint: "چەند خولەکێک چاوەڕێ بکە پاشان هەوڵبدەرەوە",
  },
  server: {
    title: "کێشەی سێرڤەر",
    hint: "تکایە دووبارە هەوڵبدەرەوە — ئەگەر بەردەوام بوو ناسنامەی پشکنینەکە بنێرە",
  },
  unknown: {
    title: "هەڵەیەک ڕوویدا",
    hint: "تکایە دووبارە هەوڵبدەرەوە",
  },
} as const
