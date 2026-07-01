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
  },
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵ بدەرەوە",
  },
  order: "ڕیز",
} as const
