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
  /**
   * The two surfaces a `featured` flag can drive. Kept apart in the UI because
   * they no longer share a budget, an ordering, or a destination.
   */
  surfaces: {
    hero: {
      heading: "سلایدەکانی پەڕەی سەرەکی",
      description:
        "لە کاروسێلی سەرەوەی پەڕەی سەرەکیدا دەردەکەون. ڕاکێشان بۆ ڕیزکردن.",
      emptyTitle: "هیچ سلایدێک نییە",
      emptySubtitle: "ناوەڕۆکێک زیاد بکە بۆ پیشاندانی لە پەڕەی سەرەکیدا",
    },
    page: {
      heading: "ڕۆشنکردنەوەی پەڕەکان",
      description:
        "لە پەڕەی تایبەتی خۆیاندا دەردەکەون — نەک لە کاروسێلی پەڕەی سەرەکی. سنووریان نییە.",
      emptyTitle: "هیچ ڕۆشنکردنەوەیەک نییە",
      emptySubtitle:
        "خزمەتگوزارییەک یان پەڕەیەکی دەربارە زیاد بکە بۆ ڕۆشنکردنەوەی لە پەڕەکەی خۆیدا",
      /** Per-source explanation of where the flag actually shows up. */
      services: "لە ڕیزی ڕۆشنکردنەوەدا لە ناو هێرۆی پەڕەی خزمەتگوزارییەکاندا دەردەکەوێت",
      about:
        "کەمترین ڕیز پێشەنگی پەڕەی دەربارە دەبێت و وێنەکەی دەبێتە وێنەی سەرەکی — ئەوانی تر لە خوارەوە دەردەکەون",
    },
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
    setImage: "دانانی وێنە",
    closeImage: "داخستنی وێنە",
    saveImage: "پاشەکەوتکردنی وێنە",
    revertImage: "گەڕاندنەوە",
  },
  field: {
    featureImage: "وێنەی هێرۆ",
    featureImageHint:
      "٢٥٦٠×١٤٤٠ — بابەتەکە لە ناوەڕاست و سەرەوە دابنێ. خوارەوە و لای ڕاست بە دەق داپۆشراون.",
    featureImageFallback: "وێنە دانەنراوە — هێرۆ وێنەی بەرگ بەکاردەهێنێت.",
    featureImageSet: "وێنە دانراوە",
    featureImageRequired: "وێنە پێویستە",
    featureImageAbout: "وێنەی سەرەکی پەڕەی دەربارە",
    featureImageAboutHint:
      "٢٥٦٠×١٤٤٠ — دەبێتە وێنەی سەرەکی پەڕەی دەربارە. ئەم وێنەیە جێگەی heroPosterUrl ی تۆمارەکە دەگرێتەوە.",
    /**
     * Shown on a service that *can* be featured as-is. The picture is optional
     * — not a warning that something is broken, a nudge that the automatic
     * choice is a wide gallery frame at 88×64.
     */
    featureImageServiceFallback:
      "بەبێ وێنە، یەکەم وێنەی گەلەری بەکاردێت — لە قەبارەی بچووکدا باش دەرناکەوێت.",
    featureImageService: "وێنەی بچووکی ڕۆشنکردنەوە",
    featureImageServiceHint:
      "٨٠٠×٦٠٠ — وێنەیەکی بچووکە لە هێرۆی پەڕەی خزمەتگوزارییەکاندا. بابەتێکی ڕوون هەڵبژێرە؛ وێنەی فراوان لەم قەبارەیەدا ناخوێنرێتەوە.",
  },
  /** The carousel cap. Services and About do not draw on it. */
  budget: {
    label: "شوێنی سلایدەکانی پەڕەی سەرەکی",
    used: (used: string, max: string) => `${used} لە ${max} بەکارهێنراوە`,
    remaining: (count: string) => `${count} شوێنی بەتاڵ ماوە`,
    full: "سنووری سلایدەکان پڕ بووە — سەرەتا یەکێک لاببە",
    hint: "خزمەتگوزاری و دەربارە لەم ژمارەیەدا نین",
  },
  /** Why the Add button is disabled, per source. */
  blocked: {
    about:
      "وێنە پێویستە — دەبێتە وێنەی سەرەکی پەڕەی دەربارە.",
    service:
      "ئەم خزمەتگوزارییە هیچ وێنەیەکی گەلەری نییە — سەرەتا وێنەیەک دابنێ.",
    donation:
      "پەڕەی بەخشین هیچ وێنەیەکی هێرۆ نییە — سەرەتا وێنە دابنێ.",
    generic: "وێنە پێویستە بۆ تایبەتکردن",
    // Only ever shown for carousel sources — services and About are uncapped.
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
    imageUpdated: "وێنە نوێکرایەوە ✓",
    imageRemoved: "وێنە لابرا",
  },
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە",
  },
  retryLabel: "دووبارە هەوڵبدەرەوە",
  order: "ڕیز",
} as const

/**
 * What the feature picture is called for this source, and what it does.
 *
 * The same column feeds three different things, and naming them all "hero
 * image" was fine only while they were all carousel slides: for About it is
 * now literally the About page's hero, and for a service it is the thumbnail
 * in the services hero's highlight rail.
 */
export function featureImageStrings(item: FeaturedCatalogItem): {
  label: string
  hint: string
} {
  switch (item.category) {
    case "about":
      return {
        label: NS.field.featureImageAbout,
        hint: NS.field.featureImageAboutHint,
      }
    case "services":
      return {
        label: NS.field.featureImageService,
        hint: NS.field.featureImageServiceHint,
      }
    default:
      return { label: NS.field.featureImage, hint: NS.field.featureImageHint }
  }
}

/** Where this item's `featured` flag shows up, for the row's helper line. */
export function surfaceNote(item: FeaturedCatalogItem): string | null {
  if (item.surface !== "page") return null
  return item.category === "about"
    ? NS.surfaces.page.about
    : NS.surfaces.page.services
}

/**
 * Why this item cannot be featured right now, or `null` when it can.
 *
 * Only the sources that validate server-side ever block: their PATCH returns
 * `400` when no image resolves, so saying which picture is missing beats
 * letting the request fail. The six publication types are never blocked here,
 * and the slide cap no longer blocks services or About at all.
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
