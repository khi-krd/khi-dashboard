/** Central CKB copy for the writings module (verbatim from spec §11). */

import type { BookGenre } from "@/types/writings"
import { BOOK_GENRES } from "@/types/writings"

export const GENRE_LABEL_CKB: Record<BookGenre, string> = {
  NOVEL: "ڕۆمان",
  SHORT_STORY: "چیرۆکی کورت",
  POETRY: "شیعر",
  ESSAY: "وتار",
  DRAMA: "شانۆ",
  HISTORY: "مێژوو",
  BIOGRAPHY: "ژیاننامە",
  POLITICAL: "سیاسەت",
  GEOGRAPHY: "جوگرافیا",
  ACADEMIC: "ئەکادیمی",
  REFERENCE: "سەرچاوەی زانست",
  LINGUISTICS: "زمانناسی",
  RELIGIOUS: "ئاینی",
  FOLKLORE: "فۆلکلۆر",
  CHILDREN: "منداڵان",
  OTHER: "یەکەگیر",
}

export { BOOK_GENRES }

export const NS = {
  dash: "—",
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.",
    retry: "دووبارە هەوڵبدەرەوە",
    validation: "داواکارییەکە هەڵەی هەیە — تکایە خانەکان بپشکنە.",
  },
  validation: {
    languageRequired: "لانیکەم زمانێک پێویستە",
    topicNameRequired: "ناوی بابەت پێویستە",
  },
  page: {
    title: "نووسراوەکان",
    subtitle: "بەڕێوەبردنی هەموو کتێب و نووسراوە بڵاوکراوەکان",
  },
  topics: {
    page: {
      title: "بابەتەکانی نووسراوە",
      subtitle: "بەڕێوەبردنی بابەتەکانی پۆلێنکردنی نووسراوە",
    },
    link: "بەڕێوەبردنی بابەتەکان",
    empty: {
      title: "هیچ بابەتێک نییە",
      subtitle: "یەکەم بابەتت زیاد بکە بۆ ڕێکخستنی نووسراوەکان",
    },
    delete: {
      title: "سڕینەوەی ئەم بابەتە؟",
      body: (count: string) =>
        `ئەم بابەتە لە ${count} کتێبدا بەکارهاتووە. کتێبەکان نامێننەوە بێ بابەت، بەڵام پەیوەندیی بابەت لاو دەبێت.`,
    },
  },
  topic: {
    name_ckb: "ناوی سۆرانی",
    name_kmr: "ناوی کورمانجی",
    usage: (count: string) => `${count} کتێب`,
    empty: "بێ بابەت",
  },
  series: {
    page: {
      title: "زنجیرەکانی نووسراوە",
      subtitle: "بەڕێوەبردنی زنجیرە و چاپە ڕیزکراوەکانی نووسراوەکان",
    },
    link: "بەڕێوەبردنی زنجیرەکان",
    empty: {
      title: "هیچ زنجیرەیەک نییە",
      subtitle: "کتێبەکانت بەسەری زنجیرە بکە بۆ ڕیزکردنیان.",
    },
    dialog: {
      title: "بەستنەوەی کتێب بەو زنجیرە",
      book_picker: "کتێب",
      series_picker: "زنجیرە",
      confirm: "بەستنەوە",
    },
    mode: {
      standalone: "تەنیا",
      part_of: "پارچەی زنجیرە",
    },
    book_in: (n: string, total: string) => `کتێبی ${n} لە ${total}`,
    parent_badge: "ڕیشە",
    total_books: (count: string) => `${count} کتێب لە زنجیرە`,
    banner_label: "زنجیرە",
  },
  breadcrumb: {
    dashboard: "داشبۆرد",
    writings: "نووسراوەکان",
    topics: "بابەتەکان",
    series: "زنجیرەکان",
    new: "کتێبی نوێ",
    edit: "دەستکاری کتێب",
  },
  view_mode: {
    shelf: "شێلف",
    table: "خشتە",
  },
  action: {
    new: "کتێبی نوێ",
    new_topic: "بابەتی نوێ",
    new_series: "زنجیرەی نوێ",
    link_to_series: "بەستنەوەی کتێبی نوێ بەو زنجیرە",
    link_existing: "بەستنەوە بۆ زنجیرەی هەبوو",
    add_to_series: "زیادکردن بۆ زنجیرە",
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
    download: "داگرتنی کتێب",
    download_ckb: "سۆرانی",
    download_kmr: "کورمانجی",
    download_both: "هەردووکیان",
    view_on_site: "بینین لە سایت",
    use_url_instead: "یان لینکی فایل بەکاربهێنە",
    view_series: "بینینی هەموو کتێبەکانی زنجیرە",
    preview: "پێشبینین",
    view_series_short: "بینینی زنجیرە",
  },
  genre: {
    group: {
      literary: "ئەدەب و داستان",
      history_society: "مێژوو و مرۆڤایەتی",
      knowledge: "زانست و زانیاری",
      culture_life: "کلتوور و ژیان",
    },
    selected_count: (count: string) => `${count} هەڵبژێردراوە`,
    empty_helper: "هیچ جۆرێک هەڵنەبژێردراوە",
  },
  filter: {
    search_placeholder: "گەڕان لە ناونیشان، نووسەر، تاگ، یان کلیلەوشە",
    search_mode: {
      writer: "نووسەر",
      tag: "تاگ",
      keyword: "کلیلەوشە",
    },
    all_writers: "هەموو نووسەران",
    all_genres: "هەموو جۆرەکان",
    all_topics: "هەموو بابەتەکان",
    all_languages: "هەموو زمانەکان",
    all_institute: "هەردووکیان",
    only_institute: "تەنیا بەرهەمی دەزگا",
    only_external: "تەنیا بەرهەمی دەرەکی",
    lang_ckb_only: "تەنیا سۆرانی",
    lang_kmr_only: "تەنیا کورمانجی",
    lang_both: "هەردووکیان",
    genre_count: (count: string) => `${count} جۆر`,
  },
  col: {
    cover: "ڕووکار",
    title: "ناونیشان",
    writer: "نووسەر",
    genres: "جۆرەکان",
    topic: "بابەت",
    languages: "زمانەکان",
    pages: "لاپەڕەکان",
    series: "زنجیرە",
    featured: "تایبەت",
    featured_order: "ڕیزکردن",
    date: "بەروار",
    actions: "کردارەکان",
  },
  section: {
    genres: "جۆرەکانی کتێب",
    editorial_genre: "جۆری ئەدەبی",
    book_files: "فایلەکانی کتێب",
    series: "زنجیرە",
    institute: "بەرهەمی دەزگا",
    cover_trio: "وێنە ڕووکارەکان",
    tags: "تاگەکان",
    keywords: "کلیلەوشەکان",
    languages: "زمانەکان",
    topic: "بابەت",
    writer: "نووسەر",
    files_format: "فایلەکان و فۆڕمات",
    reader: "خوێندنەوە و داگرتن",
    dates: "بەروارەکان",
    system: "زانیاری سیستەم",
    actions: "کردارەکان",
    description: "وەسف",
  },
  cover: {
    ckb: "ڕووکاری سۆرانی",
    kmr: "ڕووکاری کورمانجی",
    hover: "وێنەی هۆڤەر",
    hover_hint: "دەرکەوتە لە سەر هۆڤەر",
    hover_long_hint:
      "ئەم وێنەیە تەنیا کاتێک ماوس دەچێتە سەر کارت دەردەکەوێت",
    helper: "PNG، JPEG، WEBP · زۆرترین قەبارە 5 MB",
  },
  field: {
    title_ckb: "ناونیشانی کتێب بە سۆرانی…",
    title_kmr: "Sernavê pirtûkê bi Kurmancî…",
    body_ckb: "وەسفی کتێبەکەت لێرە بنووسە…",
    body_kmr: "Vekolîna pirtûka xwe li vir binivîse…",
    writer_ckb: "ناوی نووسەر بە سۆرانی…",
    writer_kmr: "Navê nivîskar bi Kurmancî…",
    editorial_genre_ckb: "بۆ نموونە: ڕۆمانی مێژووی، کتێبی منداڵان…",
    editorial_genre_kmr: "Mînak: Romana dîrokî, pirtûka zarokan…",
    editorial_genre_label_ckb: "جۆری ئەدەبی (سۆرانی)",
    editorial_genre_label_kmr: "جۆری ئەدەبی (کورمانجی)",
    format: "فۆڕمات",
    page_count: "ژمارەی پەڕەکان",
    page_count_placeholder: "٣٢٠",
    page_count_helper: "کۆی لاپەڕەکانی ئەم زمانە",
    book_file_drop: "فایلی کتێب باربکە",
    book_file_helper: "PDF · DOCX · EPUB · TXT",
    book_file_label: "فایلی کتێب",
    institute_label: "بەرهەمی دەزگا",
    institute_helper: "ئەگەر کتێبەکە لە لایەن دەزگاوە بەرهەمهێنرابێت",
    standalone_helper:
      "ئەم کتێبە سەربەخۆیە. لە دواتر دەتوانیت بەسەری زنجیرەی بکەیت.",
    series_name: "ناوی زنجیرە",
    series_order: "ڕیزی لە زنجیرە",
    series_order_helper: "شوێنی ئەم کتێبە لە زنجیرەکەدا",
    series_total: "کۆی کتێبەکانی زنجیرە",
    series_total_helper: "کۆی کتێبەکانی زنجیرە",
    topic_helper: "بابەتەکان بۆ پۆلبەندی نووسراوەکانن",
    topic_empty: "بێ بابەت",
  },
  pages: {
    suffix: "پەڕە",
  },
  institute: {
    badge: "بەرهەمی دەزگا",
    detail_helper: "ئەم کتێبە لە لایەن دەزگاوە بەرهەمهێنراوە",
  },
  status: {
    published: "بڵاوکراوە",
  },
  total: {
    count: (count: string) => `کۆی ${count} نووسراوە`,
  },
  pagination: {
    range: (from: string, to: string, total: string) =>
      `ڕیزی ${from}–${to} لە ${total}`,
  },
  empty: {
    no_writings: {
      title: "هیچ نووسراوەیەک نییە",
      subtitle: "یەکەم کتێبت زیاد بکە بۆ دەستپێکردن",
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
    title: "نووسراوە نەدۆزرایەوە",
    cta: "گەڕانەوە بۆ لیست",
    series: "زنجیرە نەدۆزرایەوە",
  },
  toast: {
    created: "نووسراوە بەسەرکەوتوویی دروستکرا",
    updated: "نووسراوە بەسەرکەوتوویی نوێکرایەوە",
    saved: "نووسراوە بەسەرکەوتوویی پاشەکەوتکرا",
    deleted: "نووسراوە سڕایەوە",
    linked_to_series: "بەو زنجیرە بەسترایەوە",
    topic_created: "بابەت دروستکرا",
    topic_deleted: "بابەت سڕایەوە",
    copied: "لەبەرگیرایەوە",
    view_action: "بینین",
  },
  dialog: {
    delete: {
      title: "سڕینەوەی ئەم نووسراوەیە؟",
      body: "ئەم کردارە ناتوانرێت بگەڕێندرێتەوە. کتێبەکە بەو هەموو فایل، وێنە و زانیارییەکانییەوە بۆ هەمیشە دەسڕێتەوە.",
      series_warning: (seriesName: string) =>
        `ئەم کتێبە لە زنجیرەی «${seriesName}»دا یە. سڕینەوەی پەیوەندیی زنجیرە بۆ کتێبە مناڵەکانی لاو دەبێت.`,
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
  lang: {
    ckb: "سۆرانی",
    kmr: "کورمانجی",
  },
  files_meta: {
    format_ckb: "فۆڕماتی سۆرانی",
    format_kmr: "فۆڕماتی کورمانجی",
    size_ckb: "قەبارەی سۆرانی",
    size_kmr: "قەبارەی کورمانجی",
    pages_ckb: "لاپەڕەکانی سۆرانی",
    pages_kmr: "لاپەڕەکانی کورمانجی",
  },
}

export function truncateTitle(title: string, max = 40): string {
  const t = title.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}
