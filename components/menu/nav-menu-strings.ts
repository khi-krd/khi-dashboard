/** Central CKB copy for the nav-menu module. */

export const NM = {
  dash: "—",
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.",
    retry: "دووبارە هەوڵبدەرەوە",
  },
  page: {
    title: "مێنیوی ماڵپەڕ",
    subtitle:
      "بەستەرەکانی مێنیوی ماڵپەڕ — تەنها وێنەی پشتەوەی هەر بەستەرێک لێرە دەگۆڕدرێت.",
    itemsTitle: "بەستەرەکانی مێنیو",
    totalCount: (n: string) => `${n} بەستەر`,
    empty: "هیچ بڕگەیەک نییە.",
    itemLabel: (n: string) => `بەستەر ${n}`,
  },
  breadcrumb: {
    dashboard: "داشبۆرد",
    menu: "مێنیوی ماڵپەڕ",
  },
  action: {
    save: "پاشەکەوتکردن",
    saving: "پاشەکەوتکردن…",
  },
  field: {
    image: "وێنەی پشتەوە",
    imageHint:
      "ئەم وێنەیە تەواوی شاشە دادەپۆشێت — پێشنیاری پانی ٢٠٠٠px یان زیاتر.",
    inactive: "ناچالاک",
  },
  toast: {
    saved: "گۆڕانکارییەکان پاشەکەوت کران",
  },
} as const

export function truncateLabel(value: string, max = 60): string {
  const t = value.trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}
