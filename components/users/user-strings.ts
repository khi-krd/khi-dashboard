import type { UserRole } from "@/types/auth"

export const ROLE_LABELS: Record<UserRole, string> = {
  GUEST: "میوان",
  EMPLOYEE: "کارمەند",
  ADMIN: "بەڕێوەبەر",
  SUPER_ADMIN: "سەرپەرشتیار",
}

export const ROLE_BADGE_VARIANT: Record<
  UserRole,
  "default" | "secondary" | "outline"
> = {
  GUEST: "outline",
  EMPLOYEE: "secondary",
  ADMIN: "default",
  SUPER_ADMIN: "default",
}

export const ROLE_ORDER: UserRole[] = [
  "GUEST",
  "EMPLOYEE",
  "ADMIN",
  "SUPER_ADMIN",
]

export const NS = {
  title: "بەکارهێنەران",
  subtitle: "بینین، گەڕان و بەڕێوەبردنی هەموو بەکارهێنەران",
  count: (n: string) => `کۆی ${n} بەکارهێنەر`,
  mockNotice:
    "ئەم پەڕەیە بە داتای نموونەییە — هێشتا ئەندپۆینتی بەڕێوەبردنی بەکارهێنەران لە سێرڤەردا بەردەست نییە.",
  search_placeholder: "گەڕان بە ناو، ناوی بەکارهێنەر، یان ئیمەیڵ…",
  filter: {
    role_all: "هەموو ڕۆڵەکان",
    status_all: "هەموو دۆخەکان",
    active: "چالاک",
    inactive: "ناچالاک",
    reset: "پاککردنەوە",
  },
  status: {
    active: "چالاک",
    inactive: "ناچالاک",
  },
  table: {
    user: "بەکارهێنەر",
    email: "ئیمەیڵ",
    role: "ڕۆڵ",
    status: "دۆخ",
    provider: "سەرچاوە",
    date: "بەروار",
  },
  action: {
    menu: "کردارەکان",
    activate: "چالاککردن",
    deactivate: "ناچالاککردن",
    changeRole: "گۆڕینی ڕۆڵ",
    delete: "سڕینەوەی بەکارهێنەر",
  },
  empty: "هیچ بەکارهێنەرێک نەدۆزرایەوە",
  error: "هەڵە لە داگرتنی بەکارهێنەران",
  retry: "دووبارە هەوڵدان",
  pagination: {
    range: (from: string, to: string, total: string) =>
      `ڕیزی ${from}–${to} لە ${total}`,
  },
  toast: {
    roleChanged: "ڕۆڵی بەکارهێنەر گۆڕا",
    activated: "بەکارهێنەر چالاککرا",
    deactivated: "بەکارهێنەر ناچالاککرا",
    deleted: "بەکارهێنەر سڕایەوە",
    error: "کردارەکە سەرکەوتوو نەبوو",
  },
  delete: {
    title: "سڕینەوەی بەکارهێنەر؟",
    body: (name: string) =>
      `دڵنیایت لە سڕینەوەی «${name}»؟ ئەم کردارە گەڕانەوەی نییە.`,
    confirm: "بەڵێ، بیسڕەوە",
    cancel: "پاشگەزبوونەوە",
  },
} as const
