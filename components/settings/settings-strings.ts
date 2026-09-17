/** Central CKB copy for the site settings module. */

export const NS = {
  dash: "—",
  breadcrumb: {
    dashboard: "داشبۆرد",
    settings: "ڕێکخستنەکان",
    branding: "براندینگ",
  },
  page: {
    title: "براندینگی ماڵپەڕ",
    subtitle:
      "لۆگۆی پەیمانگا، وێنەی باندی بەخشین، و سنووری سلایدەکانی پەڕەی سەرەکی",
  },
  logo: {
    label: "لۆگۆی ماڵپەڕ",
    hint: "٥١٢×٥١٢ PNG بە پاشبنەمای ڕوون (transparent).",
    /**
     * The one thing this screen exists to say. A logo with a white box baked
     * into it looks right in the header and wrong in the footer, and the
     * editor cannot see that from a single preview.
     */
    warning:
      "لۆگۆکە لە سەرەوەی پەڕەدا لەسەر پاشبنەمایەکی کرێمی و لە خوارەوەدا لەسەر پاشبنەمایەکی ڕەش دەردەکەوێت. PNG بە پاشبنەمای ڕوون بەکاربهێنە — نەک JPG.",
    preview: {
      header: "سەرەوەی پەڕە",
      footer: "خوارەوەی پەڕە",
    },
    empty: "لۆگۆ دانەنراوە — ماڵپەڕ لۆگۆی خۆی بەکاردەهێنێت.",
  },
  donate: {
    label: "وێنەی باندی بەخشین",
    hint: "٢٠٠٠×١٥٠٠ JPG (کەمترین ١٦٠٠×١٢٠٠).",
    /** Two facts an editor cannot guess from the picker. */
    warning:
      "هەمان وێنە دوو جار بەکاردێت: بە ڕوونی لە ناو پانێڵە لارەکەدا و دووبارە بە شێوەیەکی ئاڵۆز لە پشتیەوە. پانێڵەکە بڕینێکی لارە — بابەتەکە لە ناوەڕاست دابنێ، چونکە لای چەپ و ڕاست لە هەندێک پانیدا دەبڕدرێن.",
    preview: {
      sharp: "ڕوون",
      blurred: "ئاڵۆز",
    },
    empty: "وێنە دانەنراوە — باندەکە لەسەر پاشبنەمایەکی تاریکی سادە دەردەکەوێت.",
  },
  slides: {
    label: "سنووری سلایدەکانی پەڕەی سەرەکی",
    hint: "لە نێوان ١ و ٢٠. سنووری کاروسێلی پەڕەی سەرەکییە بۆ هەموو جۆرەکانی ناوەڕۆکی تایبەت.",
  },
  fonts: {
    title: "فۆنتەکانی ماڵپەڕ",
    hint: "فۆنتەکان باربکە و یەکێکیان چالاک بکە بۆ هەر زمانێک — ماڵپەڕ هەمان فۆنتی چالاککراو بەکاردەهێنێت. فۆرماتی woff2 باشترینە؛ ttf و otf و woffیش ڕێگەپێدراون.",
    /** Which site language each column feeds. */
    ckb: {
      label: "سۆرانی (CKB)",
      /** Sample sentence rendered in the uploaded face. */
      sample: "سڵاو لە جیهان — دەقی نموونەیی بە کوردی سۆرانی",
    },
    kmr: {
      label: "کورمانجی (KMR)",
      sample: "Silav li cîhanê — deqa nimûneyî bi kurmancî",
    },
    upload: "بارکردنی فۆنت",
    uploading: "باردەکرێت…",
    activate: "چالاککردن",
    active: "چالاک",
    deactivate: "ناچالاککردن",
    remove: "سڕینەوە",
    formats: "woff2 · woff · ttf · otf",
    empty: "هیچ فۆنتێک بۆ ئەم زمانە دانەنراوە — فۆنتی بنەڕەتی ماڵپەڕ بەکاردێت.",
    uploadFailed: "بارکردنی فۆنتەکە سەرکەوتوو نەبوو.",
    toast: {
      added: "فۆنتەکە زیادکرا بۆ کۆگا",
      activated: "فۆنتەکە چالاککرا",
      deactivated: "فۆنتەکە ناچالاککرا",
      removed: "فۆنتەکە سڕایەوە",
    },
  },
  colors: {
    title: "ڕەنگەکانی ماڵپەڕ",
    hint: "ڕەنگی هەر بەشێک دیاری بکە بە کۆدی hex یان بە هەڵبژێری ڕەنگ — بەتاڵی واتە ڕەنگی بنەڕەتی.",
    /** The four surfaces the website lets admins recolor. */
    body: "پاشبنەمای پەڕەکان",
    navbar: "بانێڵی سەرەوە",
    footer: "فووتەر",
    /** Drives every dark home band: film + sound sections, image-collection tray. */
    collection: "بەشە تاریکەکانی ماڵەوە",
    resetField: "بنەڕەت",
    resetAll: "گەڕانەوە بۆ ڕەنگی بنەڕەتی",
    custom: "دیاریکراو",
    defaultTag: "بنەڕەت",
  },
  offHost:
    "ئەم لینکە لە کۆگای ماڵپەڕەکە نییە — تا دابەزاندنێکی نوێی ماڵپەڕ نەکرێت دەرناکەوێت.",
  emptyOk: "بەتاڵ هێشتنەوەی هەردوو وێنەکە ڕێگەپێدراوە.",
  action: {
    save: "پاشەکەوتکردن",
    saving: "پاشەکەوتکردن…",
    back: "گەڕانەوە",
  },
  toast: {
    saved: "ڕێکخستنەکان پاشەکەوتکران",
  },
  error: {
    generic: "هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.",
    retry: "دووبارە هەوڵبدەرەوە",
    /** `403` arrives with an empty body, so the copy has to live here. */
    forbidden: "مۆڵەتت نییە بۆ ئەم کارە — تەنها بەڕێوەبەر دەتوانێت.",
  },
} as const
