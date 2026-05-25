import type { UserResponse, UserRole } from "@/types/auth"

/**
 * MOCKUP DATA — the KHI backend reference exposes no "list all users" endpoint
 * yet (all /api/user/* routes are self-service). This seeds the admin users
 * page until a real `GET /api/admin/users` lands. See services/usersService.ts.
 */

const FIRST_NAMES = [
  "ئاکار",
  "هێرۆ",
  "دڵنیا",
  "ڕێبین",
  "شیلان",
  "کارزان",
  "ئەڤین",
  "هاوژین",
  "بەختیار",
  "نیان",
  "زانا",
  "روخۆش",
  "هاوار",
  "سۆزان",
  "ئارام",
  "بەهار",
  "دیاری",
  "ژیار",
  "گەشاو",
  "تارا",
]

const LAST_NAMES = [
  "ئەحمەد",
  "مەحمود",
  "ڕەسوڵ",
  "کەریم",
  "عەلی",
  "حەسەن",
  "ئیبراهیم",
  "سدیق",
  "ڕەشید",
  "خالید",
]

const HANDLES = [
  "akar",
  "hero",
  "dilnia",
  "rebin",
  "shilan",
  "karzan",
  "evin",
  "hawzhin",
  "bakhtiar",
  "nyan",
  "zana",
  "rwxosh",
  "hawar",
  "sozan",
  "aram",
  "bahar",
  "diari",
  "zhyar",
  "gashaw",
  "tara",
]

const ROLES: UserRole[] = ["GUEST", "EMPLOYEE", "ADMIN", "SUPER_ADMIN"]

function roleFor(index: number): UserRole {
  if (index === 0) return "SUPER_ADMIN"
  if (index % 11 === 0) return "ADMIN"
  if (index % 3 === 0) return "EMPLOYEE"
  return ROLES[index % 2 === 0 ? 0 : 1] // GUEST / EMPLOYEE mix
}

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function makeUser(index: number): UserResponse {
  const first = FIRST_NAMES[index % FIRST_NAMES.length]
  const last = LAST_NAMES[index % LAST_NAMES.length]
  const handle = `${HANDLES[index % HANDLES.length]}_${index + 1}`
  const role = roleFor(index)
  const isGoogle = index % 7 === 0
  const isActivated = index % 6 !== 0

  return {
    userId: index + 1,
    name: `${first} ${last}`,
    username: handle,
    email: `${handle}@example.com`,
    role,
    pincode: index % 4 === 0 ? 100000 + index : null,
    isActivated,
    profileImage: null,
    imageUrl: isGoogle
      ? `https://i.pravatar.cc/150?u=${encodeURIComponent(handle)}`
      : null,
    provider: isGoogle ? "google" : "local",
    createdAt: isoDaysAgo(index * 9 + 3),
    updatedAt: isoDaysAgo(index % 5),
    passwordExpiryDate: index % 8 === 0 ? isoDaysAgo(-90) : null,
  }
}

export const MOCK_USERS: UserResponse[] = Array.from({ length: 37 }, (_, i) =>
  makeUser(i),
)
