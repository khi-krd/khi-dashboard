/** Central CKB copy for the sounds module (verbatim from spec §11). */

export const NS = {
  dash: "—",
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.",
    retry: "دووبارە هەوڵبدەرەوە",
    validation: "داواکارییەکە هەڵەی هەیە — تکایە خانەکان بپشکنە.",
    uploadTooLarge: "قەبارەی فایلەکە زۆرە.",
  },
  page: {
    title: "دەنگەکان",
    subtitle: "بەڕێوەبردنی هەموو دەنگ، شیعر و مۆسیقا بڵاوکراوەکان",
  },
  topics: {
    page: {
      title: "بابەتەکانی دەنگ",
      subtitle: "بەڕێوەبردنی بابەتەکانی پۆلێنکردنی دەنگ",
      readonly_note:
        "بابەتی نوێ تەنها لە کاتی دروستکردن یان دەستکاریکردنی دەنگ دروست دەکرێت (newTopic لە فۆرمەکەدا).",
    },
    link: "بەڕێوەبردنی بابەتەکان",
    empty: {
      title: "هیچ بابەتێک نییە",
      subtitle: "یەکەم بابەتت زیاد بکە بۆ ڕێکخستنی دەنگەکان",
    },
    delete: {
      title: "سڕینەوەی ئەم بابەتە؟",
      body: (count: string) =>
        `ئەم بابەتە لە ${count} دەنگدا بەکارهاتووە. دەنگەکان نامێننەوە بێ بابەت، بەڵام پەیوەندیی بابەت لاو دەبێت.`,
    },
  },
  breadcrumb: {
    dashboard: "داشبۆرد",
    sounds: "دەنگەکان",
    topics: "بابەتەکان",
    new: "دەنگی نوێ",
    edit: "دەستکاری دەنگ",
  },
  action: {
    new: "دەنگی نوێ",
    new_topic: "بابەتی نوێ",
    new_file: "پارچەی نوێ",
    add_multiple_files: "بارکردنی چەند فایلێک",
    new_attachment: "پاشکۆی نوێ",
    new_brochure: "زیادکردنی بڕۆشێر",
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
    download_all: "داگرتنی هەموو پارچەکان",
    view_on_site: "بینین لە سایت",
    use_url_instead: "یان لینکی URL بەکاربهێنە",
  },
  state: {
    single: "تاک",
    multi: "ئەلبووم",
    album_of_memories: "ئەلبوومی بیرەوەرییەکان",
    toggle: {
      helper:
        "تاک: یەک پارچەی دەنگی — ئەلبووم: چەند پارچەیەک لە یەک ئەلبوومدا",
    },
    switch: {
      warning:
        "گۆڕین بۆ تاک، پارچە زیادەکان لادەبرێن کاتێک پاشەکەوت دەکەیت.",
    },
    context: {
      single: "تاک — یەک پارچە",
      multi: (count: string) => `ئەلبووم — ${count} پارچە`,
      album_of_memories: (count: string) =>
        `ئەلبوومی بیرەوەرییەکان — ${count} پارچە`,
    },
  },
  filter: {
    search_placeholder: "گەڕان لە ناونیشان، تاگ، یان کلیلەوشە",
    all_states: "هەموو دۆخەکان",
    all_types: "هەموو جۆرەکان",
    all_topics: "هەموو بابەتەکان",
    all_languages: "هەموو زمانەکان",
    lang_ckb_only: "تەنها سۆرانی",
    lang_kmr_only: "تەنها کورمانجی",
    lang_both: "هەردووکیان",
    state_single: "تاک",
    state_multi: "ئەلبووم",
    state_album: "ئەلبوومی بیرەوەرییەکان",
  },
  col: {
    cover: "ڕووکار",
    title: "ناونیشان",
    type: "جۆر",
    state: "دۆخ",
    topic: "بابەت",
    duration: "ماوە",
    files: "پارچەکان",
    languages: "زمانەکان",
    featured: "تایبەت",
    featured_order: "ڕیزکردن",
    actions: "کردارەکان",
  },
  section: {
    cover_trio: "وێنە ڕووکارەکان",
    files: "پارچەکان",
    file_single: "فایلی دەنگ",
    attachments: "پاشکۆ",
    brochures: "بڕۆشێرەکان",
    tags: "تاگەکان",
    keywords: "کلیلەوشەکان",
    languages: "زمانەکان",
    album_info: "زانیاری ئەلبووم",
    credits: "ستاف و شوێن",
    technical: "زانیاری تەکنیکی",
    content_meta: "زانیاری ناوەرۆک",
    topic: "بابەت",
    type: "جۆری دەنگ",
    institute: "بەرهەمی دەزگا",
    dates: "بەروارەکان",
    system: "زانیاری سیستەم",
    actions: "کردارەکان",
    description: "وەسف",
    taxonomy: "پۆلێنکردن",
  },
  cover: {
    ckb: "ڕووکاری سۆرانی",
    kmr: "ڕووکاری کورمانجی",
    hover: "وێنەی هۆڤەر",
    hover_hint: "دەرکەوتە لە سەر هۆڤەر",
    hover_long_hint:
      "ئەم وێنەیە تەنها کاتێک ماوس دەچێتە سەر کارت دەردەکەوێت",
    helper: "PNG، JPEG، WEBP · زۆرترین قەبارە 5 MB",
  },
  credits: {
    reader: "خوێنەر",
    directors: "دەرهێنەر / بەرهەمهێنەر",
    locations: "شوێنەکانی فیلمکردن",
    terms: "زاراوە / فۆڕم",
  },
  field: {
    title_ckb: "ناونیشانی دەنگ بە سۆرانی…",
    title_kmr: "Sernavê dengê bi Kurmancî…",
    body_ckb: "وەسفی دەنگەکەت لێرە بنووسە…",
    body_kmr: "Vekolîna dengê xwe li vir binivîse…",
    reader_placeholder: "ناوی خوێنەر / گۆرانیبێژ…",
    directors_placeholder: "ناوی دەرهێنەر یان بەرهەمهێنەر…",
    locations_placeholder: "شوێنی فیلمکردن یان سەرچاوە…",
    terms_placeholder: "زاراوە یان فۆڕم…",
    album_name_placeholder: "ناوی ئەلبووم…",
    publishment_year: "ساڵی بڵاوکردنەوە",
    cd_number: "ژمارەی CD",
    total_tracks: "کۆی پارچەکان",
    duration: "ماوە",
    duration_unit: "چرکە",
    size: "قەبارە",
    bit_rate: "بایترەیت",
    bit_rate_placeholder: "بۆ نموونە: 320 kbps، 24-bit",
    sample_rate: "ڕێژەی نموونە",
    sample_rate_placeholder: "بۆ نموونە: 44100 Hz",
    audio_channel: "چەناڵ",
    form: "فۆڕم",
    form_placeholder: "بۆ نموونە: کێشدار، بێکەش",
    genre: "جۆر",
    genre_placeholder: "بۆ نموونە: فۆلکلۆر، کلاسیک",
    recording_venue: "شوێنی تۆمارکردن",
    recording_venue_placeholder: "شوێنی تۆمارکردن…",
    file_title_placeholder: "ناونیشانی پارچە…",
    attachment_title_placeholder: "ناونیشانی پاشکۆ…",
    brochure_caption_placeholder: "نموونە: ڕووکاری پێشەوە",
    sound_type_required: "جۆری دەنگ پێویستە",
    sound_type_helper: "بۆ نموونە: شیعر، مۆسیقا، فۆلکلۆر، ئاینی، وتار",
    institute_label: "بەرهەمی دەزگا",
    institute_helper: "ئەگەر دەنگەکە لە لایەن دەزگاوە بەرهەمهێنرابێت",
  },
  channel: {
    stereo: "STEREO",
    mono: "MONO",
  },
  file: {
    no_title: "بێ ناونیشان",
    no_source: "بێ سەرچاوە",
    sheet_title: (n: string) => `دەستکاری پارچە #${n}`,
    delete: "سڕینەوەی پارچە",
    source_file: "بارکردنی فایل",
    source_external: "لینکی دەرەکی",
    source_embed: "لینکی Embed",
  },
  attachment: {
    no_title: "بێ ناونیشان",
    delete: "سڕینەوەی پاشکۆ",
    empty:
      "هیچ پاشکۆیەک نییە — وەک PDF یان ڤیدیۆی پێشکەشکراو زیاد بکە",
    multi_only: "پاشکۆ تەنها بۆ ئەلبووم (MULTI) بەردەستە",
  },
  brochure: {
    empty: "هیچ بڕۆشێرێک نییە",
  },
  files: {
    empty: "هیچ پارچەیەک زیاد نەکراوە",
    empty_sub: "لانیکەم یەک پارچە پێویستە بۆ دەنگەکە.",
    empty_cta: "یەکەم پارچە",
    first_required: "لانیکەم یەک پارچە پێویستە",
    count: (n: string) => `${n} پارچە`,
  },
  topic: {
    empty: "بێ بابەت",
    helper: "بابەتەکان بۆ پۆلێنکردنی دەنگەکان — هەڵبژاردن یان دروستکردنی نوێ",
    usage: (count: string) => `${count} دەنگ`,
    name_ckb: "ناوی سۆرانی",
    name_kmr: "ناوی کورمانجی",
  },
  institute: {
    badge: "ئەرشیفی دەزگا",
    detail_helper: "ئەم دەنگە لە لایەن دەزگاوە بەرهەمهێنراوە",
  },
  total: {
    count: (count: string) => `کۆی ${count} دەنگ`,
    duration: "کۆی ماوە",
    size: "کۆی قەبارە",
    files: "ژمارەی فایل",
  },
  pagination: {
    range: (from: string, to: string, total: string) =>
      `ڕیزی ${from}–${to} لە ${total}`,
  },
  empty: {
    no_sounds: {
      title: "هیچ دەنگێک نییە",
      subtitle: "یەکەم دەنگەکەت زیاد بکە بۆ دەستپێکردن",
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
    title: "دەنگ نەدۆزرایەوە",
    cta: "گەڕانەوە بۆ لیست",
  },
  toast: {
    created: "دەنگ بەسەرکەوتوویی دروستکرا",
    updated: "دەنگ بەسەرکەوتوویی نوێکرایەوە",
    deleted: "دەنگ سڕایەوە",
    saved: "دەنگ بەسەرکەوتوویی پاشەکەوتکرا",
    topic_created: "بابەت دروستکرا",
    topic_deleted: "بابەت سڕایەوە",
    copied: "لەبەرگیرایەوە",
    view_action: "بینین",
  },
  dialog: {
    delete: {
      title: "سڕینەوەی ئەم دەنگە؟",
      body: "ئەم کردارە ناتوانرێت بگەڕێندرێتەوە. دەنگەکە بەو هەموو پارچە، بڕۆشێر و پاشکۆیەکانییەوە بۆ هەمیشە دەسڕێتەوە.",
    },
  },
  unsaved: {
    indicator: "گۆڕانکارییە پاشەکەوتنەکراوەکان",
  },
  help: {
    save_requirements:
      "بۆ پاشەکەوتکردن: جۆری دەنگ، دۆخ، لانیکەم یەک زمان، ناونیشان و لانیکەم یەک پارچە پێویستن.",
  },
  system: {
    id: "ناسنامە",
    created_at: "دروستکراوە",
    updated_at: "نوێکراوەتەوە",
  },
  player: {
    now_playing: "دەنگی ئێستا",
  },
  validation: {
    soundTypeRequired: "جۆری دەنگ پێویستە",
    trackStateInvalid: "دۆخێکی دروست هەڵبژێرە",
    languageRequired: "لانیکەم زمانێک پێویستە",
    filesRequired: "لانیکەم یەک پارچە پێویستە",
    titleCkbRequired: "ناونیشانی سۆرانی پێویستە",
    titleKmrRequired: "ناونیشانی کورمانجی پێویستە",
    fileSourceRequired:
      "هەر پارچەیەک پێویستی بە سەرچاوەیەکە (فایل، لینک، یان Embed)",
    attachmentSourceRequired:
      "هەر پاشکۆیەک پێویستی بە فایل یان لینکێکە",
    albumMemoriesSingle:
      "ئەلبوومی بیرەوەرییەکان تەنیا بۆ ئەلبووم بەردەستە",
    topicNameRequired: "ناوی بابەت پێویستە",
  },
  lang: {
    ckb: "سۆرانی",
    kmr: "کورمانجی",
  },
  list: {
    paginationRange: (from: string, to: string, total: string) =>
      `ڕیزی ${from}–${to} لە ${total}`,
  },
  sound_type_suggestions: [
    "شیعر",
    "مۆسیقا",
    "فۆلکلۆر",
    "ئاینی",
    "وتار",
    "گۆرانی",
    "دەنگی سروشت",
  ],
} as const

export function truncateTitle(title: string, max = 40) {
  const t = title.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}
