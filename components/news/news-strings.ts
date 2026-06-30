/** Central CKB copy for the news module (verbatim from spec §9 + selection UI). */

export const NS = {
  page: {
    title: "هەواڵەکان",
    subtitle: "بەڕێوەبردن و بڵاوکردنەوەی هەواڵە دووزمانییەکان",
  },
  action: {
    new: "هەواڵی نوێ",
    edit: "دەستکاری",
    delete: "سڕینەوە",
    view: "بینین",
    save: "پاشەکەوتکردن",
    saving: "پاشەکەوتکردن…",
    cancel: "هەڵوەشاندنەوە",
    back: "گەڕانەوە",
    reset_filters: "پاککردنەوەی فلتەرەکان",
    add_link: "زیادکردنی لینکی دەرەکی",
    change: "گۆڕین",
    share: "هاوبەشکردن",
    copy_url: "لەبەرگرتنەوەی ناونیشانی URL",
    view_on_site: "بینین لە سایت",
    reset_selection: "هەڵوەشاندنەوەی هەڵبژاردن",
    bulk_delete: "سڕینەوەی هەڵبژێردراوەکان",
    add_category: "+ زیادکردنی پۆلێکی نوێ",
    add_subcategory: "+ زیادکردنی ژێرپۆلێکی نوێ",
    add_inline: "زیادکردن",
    reorder_media: "جوڵاندن بۆ ڕیزکردنی میدیا",
    add_media_row: "زیادکردنی میدیا",
    add_media_link: "+ زیادکردنی لینک",
    upload_media_file: "+ بارکردنی فایل",
    replace_media_file: "گۆڕینی فایل",
    edit_media_item: "دەستکاریی میدیا",
    add_gallery_item: "زیادکردنی میدیا",
  },
  coverKind: {
    IMAGE: "وێنە",
    VIDEO: "ڤیدیۆ",
    AUDIO: "دەنگ",
  },
  selection: {
    /** {count} is inserted as formatted digits */
    summary: (count: string) => `${count} هەواڵ هەڵبژێردراوە`,
  },
  filter: {
    toolbar_title: "فلتەرکردن",
    search_label: "گەڕان",
    status_label: "دۆخ",
    language_label: "زمان",
    category_label: "پۆل",
    /** Shown under status when draft/archived are selected (client no-op today). */
    draft_archived_hint:
      "تێبینی: فلتەری «ڕەشنووس» و «ئەرشیف» هێشتا لە سێرڤەردا نییە؛ هەموو ڕیزەکان دەردەکەون.",
    search_placeholder: "گەڕان لە ناونیشان، تاگ، یان کلیلەوشە",
    all_statuses: "هەموو دۆخەکان",
    all_languages: "هەموو زمانەکان",
    all_categories: "هەموو پۆلەکان",
    lang_ckb_only: "تەنیا سۆرانی",
    lang_kmr_only: "تەنیا کورمانجی",
    lang_both: "هەردووکیان",
    reset: "ڕێکخستنەوە",
  },
  list: {
    /** {count} formatted CKB digits */
    totalCount: (count: string) => `کۆی ${count} هەواڵ`,
    paginationRange: (from: string, to: string, total: string) =>
      `ڕیزی ${from}–${to} لە ${total}`,
    paginationPageSize: "پەڕە",
    paginationPrev: "پێشوو",
    paginationNext: "دواوە",
  },
  status: {
    published: "بڵاوکراوە",
    draft: "ڕەشنووس",
    scheduled: "کاتبۆداندراو",
    archived: "ئەرشیفکراو",
  },
  lang: {
    ckb: "سۆرانی",
    kmr: "کورمانجی",
    ckbShort: "CKB",
    kmrShort: "KMR",
  },
  section: {
    languages_content: "زمانەکانی ناوەرۆک",
    classification: "پۆلبەندی",
    media: "میدیا",
    cover: "وێنەی ڕووکار",
    cover_type: "جۆری ڕووکار",
    media_gallery: "گالەری میدیا",
    publish: "بڵاوکردنەوە",
    system: "زانیاری سیستەم",
    /** Detail sidebar — short heading */
    languages: "زمانەکان",
    tags: "تاگەکان",
    keywords: "کلیلەوشەکان",
    dates: "بەروارەکان",
    actions: "کردارەکان",
  },
  field: {
    title: "ناونیشان",
    description: "وەسف",
    tags: "تاگەکان",
    keywords: "کلیلەوشەکان",
    category: "پۆل",
    subcategory: "ژێرپۆل",
    date_published: "بەرواری بڵاوکردنەوە",
    cover_or_url: "یان لینکی URL بەکاربهێنە",
    cover_drop: "وێنە و فایلەکانت دابنێ یان کلیک بکە بۆ هەڵبژاردن",
    cover_loading: "بارکردنی وێنە…",
    cover_required: "(پێویست)",
    cover_thumbnail: "وێنەی بچووکی ڕووکار",
    /** Cover section helper under dropzone */
    cover_format_hint: "PNG، JPEG، یان WEBP · زۆرترین قەبارە ٥ MB",
    title_placeholder_ckb: "ناونیشانی هەواڵ بە سۆرانی…",
    title_placeholder_kmr: "Sernivîsa nûçeyê bi Kurmancî…",
    tags_enter_helper: "Enter یان ، بۆ زیادکردن",
    keywords_enter_helper: "Enter یان ، بۆ زیادکردن",
    media_drag_empty: "وێنە و فایلەکانت دابنێ یان کلیک بکە بۆ هەڵبژاردن",
    media_type: "جۆری میدیا",
    external_url: "لینکی دەرەکی",
    embed_url: "لینکی تێخستن",
    media_direct_url: "ناونیشانی ڕاستەوخۆ",
    media_file: "فایل",
    published_at: "بڵاوکراوەتەوە",
    created_at: "دروستکراوە",
    updated_at: "نوێکراوەتەوە",
    id: "ناسنامە",
    url_example_placeholder: "https://…",
    prompt_link_value: "ناونیشانی لینک بنووسە",
    prompt_image_url: "ناونیشانی وێنە بنووسە",
  },
  mediaType: {
    IMAGE: "وێنە",
    VIDEO: "ڤیدیۆ",
    AUDIO: "دەنگ",
    DOCUMENT: "بەڵگەنامە",
    OTHER: "هیتر",
  },
  empty: {
    no_news: {
      title: "هیچ هەواڵێک نییە",
      subtitle: "یەکەم هەواڵی خۆت دروست بکە بۆ دەستپێکردن",
    },
    no_results: {
      title: "هیچ ئەنجامێک نەدۆزرایەوە",
      subtitle: "هەوڵبدە کلیلەوشە یان فلتەرەکانت بگۆڕیت",
      cta: "پاککردنەوەی فلتەرەکان",
    },
    no_media: "هیچ میدیایەک نییە",
    no_body: "وەسف بۆ ئەم زمانە بەردەست نییە.",
    no_cover: "بێ وێنەی ڕووکار",
    gallery: "هیچ میدیایەک زیاد نەکراوە",
  },
  toast: {
    copied: "لەبەرگیرایەوە",
    created: "هەواڵ بەسەرکەوتوویی دروستکرا",
    updated: "هەواڵ بەسەرکەوتوویی نوێکرایەوە",
    saved_generic: "هەواڵ بەسەرکەوتوویی پاشەکەوتکرا",
    deleted: "هەواڵ سڕایەوە",
    bulk_deleted: (count: string) => `${count} هەواڵ سڕایەوە`,
    undo: "گەڕاندنەوە",
  },
  dialog: {
    delete: {
      title: "سڕینەوەی ئەم هەواڵە؟",
      body: "ئەم کردارە ناتوانرێت بگەڕێندرێتەوە. هەواڵەکە بەو هەموو میدیا و ناوەڕۆکەکانییەوە بۆ هەمیشە دەسڕێتەوە.",
    },
    bulk_delete: {
      body: (count: string) => `${count} هەواڵ بۆ هەمیشە دەسڕێتەوە`,
    },
  },
  help: {
    publish_requirements:
      "بۆ بڵاوکردنەوە: ناونیشان، وەسف، پۆل، ژێرپۆل و وێنەی ڕووکار پێویستن",
    languages_min_one: "لانیکەم زمانێک پێویستە",
    scheduled_if_future:
      "ئەگەر بەرواری داهاتوو هەڵبژێریت، هەواڵەکە کاتبۆداندراو دەبێت",
  },
  unsaved: {
    indicator: "گۆڕانکارییە پاشەکەوتنەکراوەکان",
  },
  error: {
    retry: "هەوڵدانەوە",
    generic: "هەڵەیەک ڕوویدا",
    cover_file_alert: "بارکردنی وێنەی ڕووکار",
    cover_file_validation: "فایلەکەت پشتڕاست بکەوە (جۆری وێنە و قەبارە).",
  },
  notFound: {
    title: "هەواڵ نەدۆزرایەوە",
    cta: "گەڕانەوە بۆ لیست",
    back: "گەڕانەوە بۆ لیست",
  },
  media: {
    video: "ڤیدیۆ",
    audio: "دەنگ",
    document: "بەڵگەنامە",
  },
  column: {
    cover: "ڕووکار",
    /** Merged CKB + KMR lines (list). */
    title: "ناونیشان",
    titleCkb: "ناونیشان (سۆرانی)",
    titleKmr: "ناونیشان (کورمانجی)",
    category: "پۆلبەندی",
    languages: "زمانەکان",
    date: "بەروار",
    media: "میدیا",
    actions: "کردارەکان",
  },
  validation: {
    languageRequired: "زمانێک پێویستە",
  },
  auth: {
    sessionExpired: "ناچار بوویتە دیسان بچیتە ژوورەوە",
  },
  dash: "—",
  system: {
    id_label: "ناسنامە",
    created_at: "دروستکراوە",
    updated_at: "نوێکراوەتەوە",
  },
  breadcrumb: {
    dashboard: "داشبۆرد",
    news: "هەواڵەکان",
  },
  detail: {
    sidebar_at: "لە",
    sidebar_published_intro: "بڵاوکراوەتەوە",
    sidebar_scheduled_intro: "بڵاو دەکرێتەوە",
    sidebar_draft_intro: "هێشتا بڵاو نەکراوەتەوە",
  },
} as const

export function truncateTitle(s: string, max = 30): string {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}
