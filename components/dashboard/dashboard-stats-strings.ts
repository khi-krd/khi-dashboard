/** Kurdish labels for the dashboard statistics section. */

export const MONTH_NAMES: Record<string, string> = {
  "01": "کانوونی دووەم",
  "02": "شوبات",
  "03": "ئازار",
  "04": "نیسان",
  "05": "ئایار",
  "06": "حوزەیران",
  "07": "تەمووز",
  "08": "ئاب",
  "09": "ئەیلوول",
  "10": "تشرینی یەکەم",
  "11": "تشرینی دووەم",
  "12": "کانوونی یەکەم",
}

export function monthLabel(ym: string): string {
  const mm = ym.slice(5, 7)
  return MONTH_NAMES[mm] ?? ym
}

export const DS = {
  section: {
    title: "ئاماری ناوەڕۆک",
    subtitle: "دۆخی گشتی هەموو تۆمارەکانی پلاتفۆرمەکە — ڕاستەوخۆ لە داتابەیس",
  },
  trend: {
    title: "ڕوونەکردنەوەی مانگانە",
    subtitle: "تۆمارە نوێکان لە شەش مانگی دوایین — هەموو بەشەکان کۆکراونەتەوە",
    total: "کۆی",
  },
  cards: {
    total: "کۆی تۆمارەکان",
    thisMonth: "ئەم مانگە",
    thisYear: "ئەم ساڵە",
  },
  dimensions: {
    category: "بەپێی پۆل",
    featured: "بەپێی سەرنج",
    status: "بەپێی دۆخ",
    type: "بەپێی جۆر",
    state: "بەپێی دۆخ",
    soundType: "بەپێی جۆری دەنگ",
    kind: "بەپێی جۆر",
    entityType: "بەپێی بەش",
  },
  modules: {
    news: "هەواڵەکان",
    projects: "پرۆژەکان",
    videos: "ڤیدیۆکان",
    sounds: "دەنگەکان",
    writings: "نووسراوەکان",
    collections: "کۆمەڵە وێنەکان",
  },
  other: {
    title: "بەش و تۆمارەکانی تر",
    subtitle: "هەموو خشتەکانی داتابەیسی تر کە تۆماریان تێدایە",
    active: (total: string, active: string) => `${active} چالاک لە ${total}`,
    totalOnly: (total: string) => `کۆی ${total}`,
  },
  breakdown: {
    none: "بێ پۆل",
    featuredTrue: "سەرنجگراو",
    featuredFalse: "ئاسایی",
    status: {
      ACTIVE: "چالاک",
      ONGOING: "بەردەوام",
      COMPLETED: "تەواو",
      ARCHIVED: "ئەرشیفکراو",
    },
    videoType: {
      FILM: "فیلم",
      VIDEO_CLIP: "کلیپ",
    },
    trackState: {
      SINGLE: "تاک",
      MULTI: "ئەلبووم",
    },
    collectionType: {
      SINGLE: "وێنەی تاک",
      GALLERY: "گەلەری وێنە",
      PHOTO_STORY: "چیرۆکی وێنەیی",
    },
    writingKind: {
      single: "کتێبی سەربەخۆ",
      seriesMember: "کتێبی ناو زنجیرە",
      series: "ژمارەی زنجیرەکان",
    },
    topicEntity: {
      SOUND: "دەنگ",
      VIDEO: "ڤیدیۆ",
      WRITING: "نووسراوە",
      IMAGE: "کۆمەڵە وێنە",
    },
    submissionStatus: {
      NEW: "نوێ",
      PENDING: "چاوەڕوان",
      IN_REVIEW: "لە پێداچوونەوەدا",
      APPROVED: "پەسەندکراو",
      COMPLETED: "تەواو",
      REJECTED: "ڕەتکراوە",
      CLOSED: "داخراو",
    },
  },
  otherLabels: {
    topics: "بابەتەکان",
    newsCategories: "پۆلەکانی هەواڵ",
    newsSubCategories: "ژێرپۆلەکانی هەواڵ",
    bookGenres: "جۆرەکانی کتێب",
    soundTrackTypes: "جۆرەکانی دەنگ",
    projectTypes: "جۆرەکانی پرۆژە",
    officeTypes: "جۆرەکانی ئۆفیس",
    aboutPages: "لاپەڕەکانی دەربارە",
    contactPages: "لاپەڕەکانی پەیوەندی",
    services: "خزمەتگوزارییەکان",
    featuredItems: "بابەتە سەرنجگراوەکان",
    partners: "هاوبەشەکان",
    teamMembers: "ئەندامانی تیم",
    navMenuItems: "بابەتەکانی مینیوو",
    socialLinks: "لینکە کۆمەڵایەتییەکان",
    staticTexts: "دەقە داینامیکەکان",
    siteFonts: "فۆنتەکانی ماڵپەڕ",
    locations: "شوێنەکان",
    siteSettings: "ڕێکخستنەکانی ماڵپەڕ",
    donationTypeCards: "جۆرەکانی بەخشی دارایی",
    donationArchiveVideos: "ڤیدیۆکانی ئەرشیفی بەخشەران",
    contactMessages: "نامەکانی پەیوەندی",
    financialDonations: "بەخششی دارایی",
    archiveDonations: "بەخشی ئەرشیفی",
    soundReklamVideos: "ڤیدیۆی ڕیکلامی دەنگ",
    filmReklamVideos: "ڤیدیۆی ڕیکلامی فیلم",
    users: "بەکارهێنەرانی داشبۆرد",
  } as Record<string, string>,
  states: {
    loading: "ئامارەکان بار دەبن...",
    error: "بارکردنی ئامارەکان سەرکەوتوو نەبوو",
    retry: "دووبارە هەوڵبدەرەوە",
    empty: "هیچ تۆمارێک نییە",
  },
} as const
