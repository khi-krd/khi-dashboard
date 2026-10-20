export const TX = {
  page: {
    title: "پۆلەکان و جۆرەکان",
    subtitle: "بەڕێوەبردنی پۆلەکانی هەواڵ و جۆرەکانی پرۆژە",
  },
  tabs: {
    news: "پۆلەکانی هەواڵ",
    projects: "جۆرەکانی پرۆژە",
    sounds: "جۆرەکانی سەدا",
    offices: "جۆرەکانی نووسینگە",
  },
  col: {
    nameCkb: "ناو (کوردی)",
    nameKmr: "ناو (کورمانجی)",
    category: "پۆل",
    usage: "بەکارهێنان",
    actions: "کردارەکان",
    subs: "ژێرپۆلەکان",
  },
  action: {
    new_category: "پۆلێکی نوێ",
    new_subcategory: "ژێرپۆلێکی نوێ",
    new_type: "جۆرێکی نوێ",
    edit: "دەستکاری",
    delete: "سڕینەوە",
    cancel: "هەڵوەشاندنەوە",
    save: "پاشەکەوتکردن",
    add: "زیادکردن",
  },
  dialog: {
    create_category: "پۆلێکی نوێ",
    edit_category: "دەستکاری پۆل",
    create_subcategory: "ژێرپۆلێکی نوێ",
    edit_subcategory: "دەستکاری ژێرپۆل",
    create_type: "جۆری پرۆژەی نوێ",
    edit_type: "دەستکاری جۆری پرۆژە",
    create_sound_type: "جۆری سەدای نوێ",
    edit_sound_type: "دەستکاری جۆری سەدا",
    create_office_type: "جۆری نووسینگەی نوێ",
    edit_office_type: "دەستکاری جۆری نووسینگە",
  },
  delete: {
    title: "سڕینەوە",
    body: (count: string, unit: string) =>
      `ئەم تۆمارە لە ${count} ${unit} بەکارهێنراوە. ئەگەر بیسڕیتەوە، ئەو تۆمارانە دەچنە سەر «گشتی».`,
    bodyEmpty: "دڵنیایت لە سڕینەوەی ئەم تۆمارە؟",
    typeBody: (count: string, unit: string) =>
      `ئەم جۆرە لە ${count} ${unit} بەکارهێنراوە. سڕینەوەی تەنها لە لیستی هەڵبژاردن لایدەبات — ناوی جۆر لەسەر تۆمارەکان دەمێنێتەوە.`,
    typeBodyEmpty: "دڵنیایت لە سڕینەوەی ئەم جۆرە؟",
  },
  unit: {
    news: "هەواڵ",
    project: "پرۆژە",
    sound: "سەدا",
    office: "نووسینگە",
  },
  empty: {
    title: "هیچ تۆمارێک نییە",
    subtitle: "لێرە پۆلەکان و جۆرەکان دروست بکە بۆ ئەوەی لە فۆرمەکاندا دەستنیشان بکەیت.",
  },
  field: {
    nameCkb: "ناو بە کوردی",
    nameKmr: "ناو بە کورمانجی",
    parent: "پۆلی باوان",
  },
  toast: {
    created: "تۆمارەکە دروستکرا",
    updated: "تۆمارەکە نوێکرایەوە",
    deleted: "تۆمارەکە سڕایەوە",
    error: "هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵبدەرەوە",
  },
  dash: "—",
} as const
