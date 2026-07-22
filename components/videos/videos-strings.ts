/** Central CKB copy for the videos module (verbatim from spec §11). */

export const NS = {
  dash: "—",
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.",
    retry: "دووبارە هەوڵبدەرەوە",
  },
  page: {
    title: "ڤیدیۆکان",
    subtitle: "بەڕێوەبردنی هەموو ڤیدیۆ و کلیپە بڵاوکراوەکان",
  },
  topics: {
    page: {
      title: "بابەتەکانی ڤیدیۆ",
      subtitle: "بەڕێوەبردنی بابەتەکانی پۆلێنکردنی ڤیدیۆ",
    },
    link: "بەڕێوەبردنی بابەتەکان",
    empty: {
      title: "هیچ بابەتێک نییە",
      subtitle: "یەکەم بابەتت زیاد بکە بۆ ڕێکخستنی ڤیدیۆکان",
    },
    delete: {
      title: "سڕینەوەی ئەم بابەتە؟",
      body: (count: string) =>
        `ئەم بابەتە لە ${count} ڤیدیۆدا بەکارهاتووە. ڤیدیۆکان نامێننەوە بێ بابەت، بەڵام پەیوەندیی بابەت لاو دەبێت.`,
    },
  },
  breadcrumb: {
    dashboard: "داشبۆرد",
    videos: "ڤیدیۆکان",
    topics: "بابەتەکان",
    new: "ڤیدیۆی نوێ",
    edit: "دەستکاری ڤیدیۆ",
  },
  action: {
    new: "ڤیدیۆی نوێ",
    new_topic: "بابەتی نوێ",
    new_clip: "کلیپی نوێ",
    view: "بینین",
    edit: "دەستکاری",
    delete: "سڕینەوە",
    back: "گەڕانەوە",
    save: "پاشەکەوتکردن",
    saving: "پاشەکەوتکردن…",
    cancel: "هەڵوەشاندنەوە",
    change: "گۆڕین",
    add: "زیادکردن",
    reset_filters: "پاککردنەوەی فلتەرەکان",
    copy_url: "لەبەرگرتنەوەی ناونیشانی URL",
    share: "هاوبەشکردن",
    download: "داگرتنی فایل",
    view_on_site: "بینین لە سایت",
    use_url_instead: "یان لینکی URL بەکاربهێنە",
    auto_embed: "خۆکار وەربگرە بۆ Embed",
    remove_cover: "سڕینەوە",
  },
  filter: {
    search_placeholder: "گەڕان لە ناونیشان، تاگ، یان کلیلەوشە",
    all_types: "هەموو جۆرەکان",
    all_topics: "هەموو بابەتەکان",
    all_languages: "هەموو زمانەکان",
    lang_ckb_only: "تەنها سۆرانی",
    lang_kmr_only: "تەنها کورمانجی",
    lang_both: "هەردووکیان",
    type_film: "فیلم",
    type_clip: "ڤیدیۆ کلیپ",
    type_album: "ئەلبوومی بیرەوەرییەکان",
  },
  type: {
    film: "فیلم",
    clip: "ڤیدیۆ کلیپ",
    album: "ئەلبوومی بیرەوەرییەکان",
    toggle: {
      helper:
        "فیلم: چەند سەرچاوەی ڤیدیۆ (بەشەکان) — ڤیدیۆ کلیپ: کۆمەڵێک کلیپی ڕێکخراو",
    },
    switch: {
      warning: "گۆڕینی جۆر فایلی سەرچاوە و کلیپەکان دەسڕێتەوە",
    },
    context: {
      film: "فیلم — یەک ڤیدیۆ",
      clip: (count: string) => `ڤیدیۆ کلیپ — ${count} کلیپ`,
      album: (count: string) =>
        `ئەلبوومی بیرەوەرییەکان — ${count} کلیپی بیرەوەری`,
    },
  },
  source: {
    file: "فایل",
    youtube: "یوتیوب",
    vimeo: "ڤیمیۆ",
    embed: "ئیمبێد",
    clip_count: (count: string) => `${count} کلیپ`,
    mode: {
      file: "بارکردنی فایل",
      external: "لینکی دەرەکی (YouTube / Vimeo)",
      embed: "لینکی Embed",
    },
    s3_helper: "یان لینکی S3 / CDN ڕاستەوخۆ بنووسە",
    embed_generated: "لینکی Embed بە شێوەی خۆکار دروستکرا",
    opens_in: (provider: string) =>
      `ئەم ڤیدیۆیە لە ${provider}دا دەکرێتەوە`,
    file_drop: "فایلی ڤیدیۆ دابنێ یان کلیک بکە",
    file_helper: "MP4، WebM، MOV",
    bulk_drop: "فایلەکانی ڤیدیۆ دابنێ یان کلیک بکە",
    bulk_helper:
      "دەتوانیت چەند فایلێک یەکجار هەڵبژێریت — هەر فایلێک وەک سەرچاوەیەک زیاد دەکرێت",
    bulk_browse: "هەڵبژاردنی فایلەکان",
    bulk_or_manual: "یان سەرچاوەی تاک بە دەست زیاد بکە",
    bulk_processing: (count: string) => `خەریکی خوێندنەوەی ${count} فایل…`,
    bulk_max: (count: string) => `زۆرترین ${count} سەرچاوە ڕێگەپێدراوە`,
    empty: "هیچ سەرچاوەیەک نییە — فایلەکانی ڤیدیۆ بار بکە یان سەرچاوەی تاک زیاد بکە",
    new_source: "سەرچاوەی نوێ",
    no_label: "بێ ناونیشان",
    main_badge: "سەرەکی",
    part_count: (count: string) => `${count} بەش`,
    sheet_title: (n: string) => `دەستکاری سەرچاوە #${n}`,
    delete: "سڕینەوەی سەرچاوە",
    label_field: "ناونیشانی سەرچاوە",
    label_placeholder: "بەشی ١، 1080p…",
    main_label: "سەرچاوەی سەرەکی",
    main_helper: "ئەم سەرچاوەیە وەک سەرەکی لە لیستدا دەردەکەوێت",
    metadata_manual: "ئەم زانیارییە بە دەستی پڕ دەکرێتەوە",
  },
  col: {
    cover: "ڕووکار",
    title: "ناونیشان",
    type: "جۆر",
    topic: "بابەت",
    duration: "ماوە",
    quality: "چۆنیەتی",
    source: "سەرچاوە",
    languages: "زمانەکان",
    date: "بەروار",
    actions: "کردارەکان",
  },
  section: {
    cover_trio: "وێنە ڕووکارەکان",
    source: "سەرچاوەی ڤیدیۆ",
    clips: "کلیپەکان",
    tags: "تاگەکان",
    keywords: "کلیلەوشەکان",
    languages: "زمانەکان",
    publish: "بەرواری بڵاوکردنەوە",
    topic: "بابەت",
    credits: "ستاف",
    technical: "زانیاری تەکنیکی",
    dates: "بەروارەکان",
    system: "زانیاری سیستەم",
    actions: "کردارەکان",
  },
  cover: {
    ckb: "ڕووکاری سۆرانی",
    kmr: "ڕووکاری کورمانجی",
    hover: "وێنەی هۆڤەر",
    hover_hint: "دەرکەوتە لە سەر هۆڤەر",
    hover_long_hint:
      "ئەم وێنەیە تەنها کاتێک ماوس دەچێتە سەر کارت دەردەکەوێت",
    lang_inactive: "ئەم زمانە چالاک نییە",
    helper: "PNG، JPEG، WEBP · زۆرترین قەبارە 5 MB",
  },
  field: {
    title_ckb: "ناونیشانی ڤیدیۆ بە سۆرانی…",
    title_kmr: "Sernavê vîdyoyê bi Kurmancî…",
    director: "دەرهێنەر…",
    producer: "بەرهەمهێنەر…",
    location: "شوێنی فیلمکردن…",
    body_ckb: "وەسفی ڤیدیۆکەت لێرە بنووسە…",
    body_kmr: "Vekolîna vîdyoya xwe li vir binivîse…",
    director_label: "دەرهێنەر",
    producer_label: "بەرهەمهێنەر",
    location_label: "شوێنی فیلمکردن",
    external_placeholder: "https://youtube.com/watch?v=…",
    embed_placeholder: "https://www.youtube.com/embed/…",
    duration: "ماوە",
    duration_unit: "چرکە",
    resolution: "پاژەکی",
    format: "فۆڕمات",
    size: "قەبارە",
    size_unit: "MB",
    publish_date_helper: "بەرواری بڵاوکردنەوەی ڤیدیۆکە",
    topic_helper:
      "بابەتەکان بۆ پۆلێنکردنی ڤیدیۆکان — هەڵبژاردن یان دروستکردنی نوێ",
    album: {
      label: "ئەلبوومی بیرەوەرییەکان",
      tooltip: "ئەلبووم بۆ کلیپە بیرەوەرییەکان وەک یاد و باسەکان",
    },
    tag_helper: "Enter یان `,` بۆ زیادکردن",
  },
  clip: {
    empty: "هیچ کلیپێک نییە — فایلەکانی ڤیدیۆ بار بکە یان کلیپێکی تاک زیاد بکە",
    empty_cta: "کلیپی نوێ",
    bulk_drop: "فایلەکانی ڤیدیۆ دابنێ یان کلیک بکە",
    bulk_helper: "دەتوانیت چەند فایلێک یەکجار هەڵبژێریت — هەر فایلێک وەک کلیپێکی سەربەخۆ زیاد دەکرێت",
    bulk_browse: "هەڵبژاردنی فایلەکان",
    bulk_or_manual: "یان کلیپی تاک بە دەست زیاد بکە",
    bulk_processing: (count: string) => `خەریکی خوێندنەوەی ${count} فایل…`,
    bulk_max: (count: string) => `زۆرترین ${count} فایل ڕێگەپێدراوە`,
    no_title: "بێ ناونیشان",
    sheet_title: (n: string) => `دەستکاری کلیپ #${n}`,
    metadata_manual: "ئەم زانیارییە بە دەستی پڕ دەکرێتەوە",
    delete: "سڕینەوەی کلیپ",
    hero_label: (count: string) =>
      `${count} کلیپ — کلیک بکە بۆ بینین لە خوارەوە`,
  },
  credits: {
    director: "دەرهێنەر",
    producer: "بەرهەمهێنەر",
    location: "شوێنی فیلمکردن",
  },
  album: {
    banner:
      "💝 ئەلبوومی بیرەوەرییەکان — کۆمەڵێک کلیپی بیرەوەری ڕێکخراون لێرە",
  },
  topic: {
    empty: "بێ بابەت",
    helper: "بابەتەکان بۆ پۆلێنکردنی ڤیدیۆکان",
    add: "بابەتی نوێ",
    usage: (count: string) => `${count} ڤیدیۆ`,
    create_title: "بابەتی نوێ",
    name_ckb: "ناوی سۆرانی",
    name_kmr: "ناوی کورمانجی",
  },
  list: {
    totalCount: (count: string) => `کۆی ${count} ڤیدیۆ`,
    paginationRange: (from: string, to: string, total: string) =>
      `ڕیزی ${from}–${to} لە ${total}`,
  },
  empty: {
    no_videos: {
      title: "هیچ ڤیدیۆیەک نییە",
      subtitle: "یەکەم ڤیدیۆیەکت زیاد بکە بۆ دەستپێکردن",
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
    title: "ڤیدیۆ نەدۆزرایەوە",
    cta: "گەڕانەوە بۆ لیست",
  },
  toast: {
    created: "ڤیدیۆ بەسەرکەوتوویی دروستکرا",
    updated: "ڤیدیۆ بەسەرکەوتوویی نوێکرایەوە",
    saved: "ڤیدیۆ بەسەرکەوتوویی پاشەکەوتکرا",
    deleted: "ڤیدیۆ سڕایەوە",
    topic_created: "بابەت دروستکرا",
    topic_deleted: "بابەت سڕایەوە",
    copied: "لەبەرگیرایەوە",
    view_action: "بینین",
  },
  dialog: {
    delete: {
      title: "سڕینەوەی ئەم ڤیدیۆیە؟",
      body: "ئەم کردارە ناتوانرێت بگەڕێندرێتەوە. ڤیدیۆکە بەو هەموو کلیپ، وێنە، و فایلەکانییەوە بۆ هەمیشە دەسڕێتەوە.",
    },
  },
  unsaved: {
    indicator: "گۆڕانکارییە پاشەکەوتنەکراوەکان",
  },
  help: {
    save_requirements:
      "بۆ پاشەکەوتکردن: جۆر، لانیکەم زمانێک، ناونیشان و سەرچاوەی ڤیدیۆ (یان لانیکەم یەک کلیپ) پێویستن.",
  },
  system: {
    id: "ناسنامە",
    created_at: "دروستکراوە",
    updated_at: "نوێکراوەتەوە",
  },
  lang: {
    ckb: "سۆرانی",
    kmr: "کورمانجی",
  },
  validation: {
    generic: "داواکارییەکە هەڵەی هەیە — تکایە خانەکان بپشکنە.",
    languageRequired: "زمانێک پێویستە",
    titleCkbRequired: "ناونیشانی سۆرانی پێویستە",
    titleKmrRequired: "ناونیشانی کورمانجی پێویستە",
    sourceRequired:
      "سەرچاوەیەکی ڤیدیۆ پێویستە: فایل، لینکی دەرەکی یان لینکی Embed",
    sourceItemRequired: "هەر سەرچاوەیەک پێویستی بە فایل یان لینکێکە",
    clipsRequired: "لانیکەم یەک کلیپ پێویستە",
    clipSourceRequired: "هەر کلیپێک پێویستی بە سەرچاوەیەکە",
    topicNameRequired: "ناوێک پێویستە",
    typeRequired: "جۆری ڤیدیۆ پێویستە.",
    topicNotFound: "بابەتی هەڵبژێردراو نەدۆزرایەوە.",
  },
}

export function truncateTitle(title: string, max = 40) {
  const t = title.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}
