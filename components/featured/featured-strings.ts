import {
  canFeatureNow,
  type FeaturedCatalogItem,
} from "@/lib/featured-catalog"

export const NS = {
  title: "تایبەتەکان",
  subtitle: "بەڕێوەبردنی ناوەڕۆکی تایبەت کە لە ماڵپەڕەکەدا دەردەکەوێت",
  breadcrumb: {
    dashboard: "داشبۆرد",
    featured: "تایبەتەکان",
  },
  views: {
    featured: "تایبەتەکان",
    all: "هەموو ناوەڕۆکەکان",
  },
  sections: {
    sounds: "دەنگە تایبەتەکان",
    writings: "نووسراوە تایبەتەکان",
  },
  /** The three institutional pages, added alongside the six publication types. */
  institutional: {
    label: "پەڕە نەتەوەییەکان",
    hint: "دەربارە، خزمەتگوزاری و بەخشین هەمان شوێنی سلاید بەکاردەهێنن",
  },
  stats: {
    total: "کۆی ناوەڕۆک",
    featured: "تایبەت",
    sounds: "دەنگی تایبەت",
    writings: "نووسراوەی تایبەت",
  },
  tabs: {
    sounds: "دەنگەکان",
    writings: "نووسراوەکان",
  },
  badges: {
    featured: "تایبەت",
  },
  filters: {
    search_placeholder: "گەڕان بە ناونیشان، بابەت یان جۆر…",
    category_all: "هەموو جۆرەکان",
    status_all: "هەموو دۆخەکان",
    status_featured: "تایبەت",
    status_not_featured: "ناتایبەت",
    reset: "سڕینەوەی فلتەر",
    no_results: "هیچ ناوەڕۆکێک نەدۆزرایەوە",
    results: (count: string) => `${count} ئەنجام`,
  },
  actions: {
    add: "زیادکردن",
    browse: "گەڕان لە ناوەڕۆکەکان",
    remove: "لابردن",
    view: "بینین",
    edit: "دەستکاری",
    drag: "ڕاکێشان بۆ ڕیزکردن",
    manage_link: "بەڕێوەبردنی تایبەتەکان",
    editImage: "دەستکاری وێنە",
    closeImage: "داخستنی وێنە",
    saveImage: "پاشەکەوتکردنی وێنە",
    revertImage: "گەڕاندنەوە",
  },
  field: {
    featureImage: "وێنەی هێرۆ",
    featureImageHint:
      "٢٥٦٠×١٤٤٠ — بابەتەکە لە ناوەڕاست و سەرەوە دابنێ. خوارەوە و لای ڕاست بە دەق داپۆشراون.",
    featureImageFallback: "وێنە دانەنراوە — هێرۆ وێنەی بەرگ بەکاردەهێنێت.",
    featureImageSet: "وێنەی هێرۆ دانراوە",
    featureImageRequired: "وێنەی هێرۆ پێویستە",
  },
  /** The global cap, shared by all nine sources. */
  budget: {
    label: "شوێنی سلایدەکان",
    used: (used: string, max: string) => `${used} لە ${max} بەکارهێنراوە`,
    remaining: (count: string) => `${count} شوێنی بەتاڵ ماوە`,
    full: "سنووری سلایدەکان پڕ بووە — سەرەتا یەکێک لاببە",
    hint: "ئەم سنوورە هەموو جۆرەکان پێکەوە دەگرێتەوە",
  },
  /** Why the Add button is disabled, per source. */
  blocked: {
    about:
      "دەربارە هیچ وێنەیەکی بەرگی نییە — سەرەتا وێنەی هێرۆ دابنێ.",
    service:
      "ئەم خزمەتگوزارییە هیچ وێنەیەکی گەلەری نییە — سەرەتا وێنەی هێرۆ دابنێ.",
    donation:
      "پەڕەی بەخشین هیچ وێنەیەکی هێرۆ نییە — سەرەتا وێنە دابنێ.",
    generic: "وێنەی هێرۆ پێویستە بۆ تایبەتکردن",
    capReached: "سنووری سلایدەکان پڕ بووە",
  },
  empty: {
    title: "هیچ ناوەڕۆکی تایبەت نییە",
    subtitle: "دوگمەی گەڕان لە ناوەڕۆکەکان بەکاربهێنە بۆ زیادکردن",
    sounds_title: "هیچ دەنگێکی تایبەت نییە",
    sounds_subtitle: "دەنگێک زیاد بکە بۆ پیشاندانی لە ماڵپەڕەکەدا",
    writings_title: "هیچ نووسراوەیەکی تایبەت نییە",
    writings_subtitle: "نووسراوەیەک زیاد بکە بۆ پیشاندانی لە ماڵپەڕەکەدا",
  },
  pagination: {
    range: (from: string, to: string, total: string) =>
      `${from}–${to} لە ${total}`,
  },
  sheet: {
    title: "زیادکردنی ناوەڕۆکی تایبەت",
    subtitle: "هەموو ناوەڕۆکەکانی ماڵپەڕ بگەڕێ و ئەوەی دەتەوێت تایبەت بکە",
    close: "داخستن",
    empty: "هیچ ناوەڕۆکێکی گونجاو نەدۆزرایەوە",
  },
  toast: {
    added: "بە سەرکەوتوویی زیادکرا",
    removed: "لە تایبەت لابرا",
    reordered: "ڕیزکردن نوێکرایەوە",
    imageUpdated: "وێنەی هێرۆ نوێکرایەوە ✓",
    imageRemoved: "وێنەی هێرۆ لابرا",
  },
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە",
  },
  order: "ڕیز",
} as const

/**
 * Why this item cannot be featured right now, or `null` when it can.
 *
 * Only the three institutional sources ever block: their PATCH returns `400`
 * when no image resolves, so saying which picture is missing beats letting the
 * request fail. The six publication types are never blocked here.
 */
export function blockedReason(item: FeaturedCatalogItem): string | null {
  if (canFeatureNow(item)) return null
  switch (item.category) {
    case "about":
      return NS.blocked.about
    case "services":
      return NS.blocked.service
    case "donation":
      return NS.blocked.donation
    default:
      return NS.blocked.generic
  }
}
