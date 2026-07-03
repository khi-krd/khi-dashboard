/** Central CKB copy for the unified topics hub. */

export const TOPICS_NS = {
  page: {
    title: "بابەتەکان",
    subtitle:
      "بەڕێوەبردنی بابەتەکانی پۆلێنکردن بۆ هەموو بەشەکانی بڵاوکردنەوە",
  },
  tab: {
    videos: "ڤیدیۆکان",
    sounds: "دەنگەکان",
    collections: "کۆمەڵە وێنەکان",
    writings: "نووسراوەکان",
  },
  link: {
    open_module: "کردنەوەی لیستی بەش",
    module_topics: "بەڕێوەبردنی بابەتەکانی بەش",
  },
} as const

export type TopicsModuleKey = keyof typeof TOPICS_NS.tab
