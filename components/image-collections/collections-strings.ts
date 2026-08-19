/** Central CKB copy for image collections (verbatim from spec §11). */

export const NS = {
  dash: "—",
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.",
    retry: "دووبارە هەوڵبدەرەوە",
    validation: "داواکارییەکە هەڵەی هەیە — تکایە خانەکان بپشکنە.",
  },
  validation: {
    languageRequired: "زمانێک پێویستە",
    typeRequired: "جۆری کۆکراوە پێویستە",
    topicNameRequired: "ناوی بابەت پێویستە",
    topicNotFound: "بابەتی هەڵبژێردراو نەدۆزرایەوە",
    singleAlbumLimit: "کۆکراوەی تاک وێنە تەنها یەک وێنەی هەیە",
  },
  page: {
    title: "کۆکراوەی وێنەکان",
    subtitle: "بەڕێوەبردنی هەموو کۆکراوەی وێنە، گەلەری و چیرۆکە وێنەییەکان",
  },
  topics: {
    page: {
      title: "بابەتەکانی کۆکراوەی وێنە",
      subtitle: "بەڕێوەبردنی بابەتەکانی پۆلێنکردنی کۆکراوەی وێنە",
    },
    link: "بەڕێوەبردنی بابەتەکان",
    empty: {
      title: "هیچ بابەتێک نییە",
      subtitle: "یەکەم بابەتت زیاد بکە بۆ ڕێکخستنی کۆکراوەکان",
    },
    delete: {
      title: "سڕینەوەی ئەم بابەتە؟",
      body: (count: string) =>
        `ئەم بابەتە لە ${count} کۆکراوەدا بەکارهاتووە. کۆکراوەکان نامێننەوە بێ بابەت، بەڵام پەیوەندیی بابەت لاو دەبێت.`,
    },
    usage: (count: string) => `${count} کۆکراوە`,
  },
  breadcrumb: {
    dashboard: "داشبۆرد",
    collections: "کۆکراوەی وێنەکان",
    topics: "بابەتەکان",
    new: "کۆکراوەی نوێ",
    edit: "دەستکاری کۆکراوە",
  },
  view_mode: {
    grid: "گەلەری",
    table: "خشتە",
  },
  action: {
    new: "کۆکراوەی نوێ",
    new_topic: "بابەتی نوێ",
    new_image: "وێنەی نوێ",
    new_step: "گامی نوێ",
    first_image: "یەکەم وێنە",
    first_step: "یەکەم گام",
    upload_files: "بارکردنی فایلەکان",
    add_link: "زیادکردنی لینک",
    view: "بینین",
    edit: "دەستکاری",
    delete: "سڕینەوە",
    back: "گەڕانەوە",
    save: "پاشەکەوتکردن",
    saving: "پاشەکەوتکردن…",
    cancel: "هەڵوەشاندنەوە",
    change: "گۆڕین",
    add: "زیادکردن",
    add_gallery_image: "زیادکردنی وێنە",
    reset_filters: "پاککردنەوەی فلتەرەکان",
    copy_url: "لەبەرگرتنەوەی ناونیشانی URL",
    share: "هاوبەشکردن",
    download_all: "داگرتنی هەموو وێنەکان",
    view_on_site: "بینین لە سایت",
    use_url_instead: "یان لینکی URL بەکاربهێنە",
  },
  type: {
    single: "تاک وێنە",
    gallery: "گەلەری",
    photo_story: "چیرۆکی وێنەیی",
    toggle: {
      helper:
        "تاک وێنە: یەک وێنە — گەلەری: کۆمەڵە وێنە بۆ بینین — چیرۆکی وێنەیی: کۆمەڵە وێنە بۆ خوێندنەوە بە ڕیزدا",
    },
    switch: {
      warning_to_single: (count: string) =>
        `گۆڕین بۆ تاک وێنە، تەنیا یەکەم وێنە دەمێنێتەوە — ${count} وێنە کە لاو دەبن کاتێک پاشەکەوت دەکەیت.`,
    },
    context: {
      single: "تاک وێنە",
      gallery: (count: string) => `گەلەری — ${count} وێنە`,
      story: (count: string) => `چیرۆکی وێنەیی — ${count} گام`,
    },
  },
  filter: {
    search_placeholder: "گەڕان لە ناونیشان، تاگ، یان کلیلەوشە",
    all_types: "هەموو جۆرەکان",
    all_topics: "هەموو بابەتەکان",
    all_languages: "هەموو زمانەکان",
    lang_ckb_only: "تەنها سۆرانی",
    lang_kmr_only: "تەنها کورمانجی",
    lang_both: "هەردووکیان",
  },
  col: {
    cover: "ڕووکار",
    title: "ناونیشان",
    type: "جۆر",
    topic: "بابەت",
    items: "وێنەکان",
    location: "شوێن",
    collected_by: "کۆکەرەوە",
    date: "بەروار",
    languages: "زمانەکان",
    actions: "کردارەکان",
  },
  section: {
    cover_trio: "وێنە ڕووکارەکان",
    album: "وێنەکان",
    gallery: "گەلەری",
    story: "گامەکانی چیرۆک",
    tags: "تاگەکان",
    keywords: "کلیلەوشەکان",
    languages: "زمانەکان",
    publish: "بەرواری بڵاوکردنەوە",
    topic: "بابەت",
    credits: "ستاف و شوێن",
    album_summary: "کورتەی کۆکراوە",
    auto_meta: "زانیاری خۆکار",
    dates: "بەروارەکان",
    system: "زانیاری سیستەم",
    actions: "کردارەکان",
  },
  cover: {
    ckb: "ڕووکاری سۆرانی",
    kmr: "ڕووکاری کورمانجی",
    hover: "وێنەی هۆڤەر",
    hover_hint: "دەرکەوتە لە سەر هۆڤەر",
    hover_long_hint: "ئەم وێنەیە تەنها کاتێک ماوس دەچێتە سەر کارت دەردەکەوێت",
    helper: "PNG، JPEG، WEBP · زۆرترین قەبارە 5 MB",
  },
  credits: {
    collected_by: "کۆکەرەوە",
    location: "شوێن",
    collected_by_placeholder: "کۆکەرەوە / وێنەگر…",
    location_placeholder: "شوێن…",
  },
  field: {
    title: {
      ckb: "ناونیشانی کۆکراوە بە سۆرانی…",
      kmr: "Sernavê komkirinê bi Kurmancî…",
    },
    body: {
      ckb: "وەسفی کۆکراوەکەت لێرە بنووسە…",
      kmr: "Vekolîna komkirina xwe li vir binivîse…",
    },
    caption_placeholder: {
      ckb: "نووسە بە سۆرانی…",
      kmr: "Şîrove bi Kurmancî…",
    },
    description_placeholder: {
      ckb: "وەسفی درێژ بە سۆرانی…",
      kmr: "Vekolîna dirêj bi Kurmancî…",
    },
    story_step_caption_placeholder: {
      ckb: "نووسە بە سۆرانی…",
    },
    story_step_description_placeholder: {
      ckb: "وەسف بە سۆرانی… (چیرۆکی ئەم گامە)",
    },
    story_lang_hint:
      "گۆڕینی زمان لە سەرەوە، چیرۆکەکە بەو زمانە دەنوێنرێت.",
    single_drop: "وێنە دابنێ یان کلیک بکە بۆ هەڵبژاردن",
    single_helper: "PNG، JPEG، WEBP · زۆرترین قەبارە 20 MB",
  },
  meta: {
    dimensions: "پاژەکی",
    aspect_ratio: "ڕێژەی ڕووکار",
    size: "قەبارە",
    mime_type: "جۆری فایل",
    auto_tooltip: "زانیاری بە شێوەی خۆکار دۆزراوەتەوە لە کاتی بارکردندا.",
  },
  item: {
    no_caption: "بێ نووسە",
    no_source: "بێ سەرچاوە",
    sheet_title: (n: string) => `دەستکاری وێنە #${n}`,
    delete: "سڕینەوەی وێنە",
  },
  step: {
    label: (n: string, total: string) => `گامی ${n} / ${total}`,
  },
  story: {
    empty:
      "چیرۆکەکەت بە زیادکردنی یەکەم وێنە دەستپێبکە. هەر گامێک پێکدێت لە وێنە و نووسە.",
  },
  gallery: {
    empty_title: "وێنەکانت بهێنە بۆ گەلەرییەکە",
    empty_subtitle: "فایل بار بکە یان لینکی دەرەکی زیاد بکە — دەتوانیت چەند وێنەیەک پێکەوە بار بکەیت.",
    empty: "وێنەکانت بهێنە یان لینک زیاد بکە بۆ گەلەرییەکە.",
  },
  collection: {
    empty: "هیچ وێنەیەک زیاد نەکراوە.",
  },
  topic: {
    empty: "بێ بابەت",
    helper: "بابەتەکان بۆ پۆلبەندی کۆکراوەکانن — هەڵبژاردن یان دروستکردنی نوێ",
    usage: (count: string) => `${count} کۆکراوە`,
    name_ckb: "ناوی سۆرانی",
    name_kmr: "ناوی کورمانجی",
  },
  summary: {
    image_count: "ژمارەی وێنە",
    uploaded: "وێنە بارکراوەکان",
    external: "لینکی دەرەکی",
    total_size: "کۆی قەبارە",
  },
  total: {
    count: (count: string) => `کۆی ${count} کۆکراوە`,
  },
  pagination: {
    range: (from: string, to: string, total: string) =>
      `ڕیزی ${from}–${to} لە ${total}`,
  },
  empty: {
    no_collections: {
      title: "هیچ کۆکراوەیەک نییە",
      subtitle: "یەکەم کۆکراوەی وێنەکانت زیاد بکە بۆ دەستپێکردن",
    },
    no_results: {
      title: "هیچ ئەنجامێک نەدۆزرایەوە",
      subtitle: "هەوڵبدە کلیلەوشە یان فلتەرەکانت بگۆڕیت",
      cta: "پاککردنەوەی فلتەرەکان",
    },
    no_cover: "بێ وێنەی ڕووکار",
    no_body: "وەسف بۆ ئەم زمانە بەردەست نییە.",
  },
  not_found: {
    title: "کۆکراوە نەدۆزرایەوە",
    cta: "گەڕانەوە بۆ لیست",
  },
  toast: {
    created: "کۆکراوە بەسەرکەوتوویی دروستکرا",
    updated: "کۆکراوە بەسەرکەوتوویی نوێکرایەوە",
    deleted: "کۆکراوە سڕایەوە",
    topic_created: "بابەت دروستکرا",
    topic_deleted: "بابەت سڕایەوە",
    copied: "لەبەرگیرایەوە",
    view_action: "بینین",
  },
  dialog: {
    delete: {
      title: "سڕینەوەی ئەم کۆکراوەیە؟",
      body: "ئەم کردارە ناتوانرێت بگەڕێندرێتەوە. کۆکراوەکە بەو هەموو وێنە و زانیارییەکانییەوە بۆ هەمیشە دەسڕێتەوە.",
    },
  },
  unsaved: {
    indicator: "گۆڕانکارییە پاشەکەوتنەکراوەکان",
  },
  help: {
    save_requirements:
      "هەموو خانەکان ئارەزوومەندانەن — دەتوانیت بە هەر بەشێکی پڕکراوەوە پاشەکەوت بکەیت",
  },
  system: {
    id: "ناسنامە",
    created_at: "دروستکراوە",
    updated_at: "نوێکراوەتەوە",
  },
  source: {
    mode: {
      file: "بارکردنی فایل",
      external: "لینکی دەرەکی",
      embed: "لینکی Embed",
    },
  },
  lang: {
    ckb: "سۆرانی",
    kmr: "کورمانجی",
  },
}

export function truncateTitle(title: string, max = 40): string {
  const t = title.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}
