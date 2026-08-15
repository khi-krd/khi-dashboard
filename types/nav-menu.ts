/**
 * Hamburger nav menu — the ten top-level website sections, their bilingual copy,
 * the full-screen background photo behind each one, and their secondary links.
 *
 * Shape follows `NAV_MENU_BACKEND.md` §3. The backend omits null fields rather
 * than returning them as `null`, so every optional value here is normalized to
 * an explicit `null` by `lib/nav-menu-normalize.ts` before it reaches the UI.
 */

export type ApiResponse<T> = {
  success: boolean
  message: string
  data?: T
}

export type NavMenuLinkDto = {
  /** Null only for rows the editor has added but not saved yet. */
  id: number | null
  labelCkb: string
  labelKmr: string | null
  href: string
  displayOrder: number
  active: boolean
}

export type NavMenuItemDto = {
  id: number | null
  /**
   * Immutable once created. Six sections (news, projects, sound, video, gallery,
   * writings) use this key to build their secondary links from CMS taxonomy, so
   * renaming it silently detaches them — see §1 rule 5.
   */
  itemKey: string
  labelCkb: string
  labelKmr: string | null
  descriptionCkb: string | null
  descriptionKmr: string | null
  href: string
  imageUrl: string | null
  displayOrder: number
  active: boolean
  links: NavMenuLinkDto[]
}

export type NavMenuListResponse = ApiResponse<NavMenuItemDto[]>
export type NavMenuSingleResponse = ApiResponse<NavMenuItemDto>

/** Keys whose secondary links the website derives from CMS taxonomy (§6.7). */
export const NAV_MENU_DERIVED_KEYS = [
  "news",
  "projects",
  "sound",
  "video",
  "gallery",
  "writings",
] as const

/** The website renders at most this many secondary links per section (§6.7). */
export const NAV_MENU_MAX_VISIBLE_LINKS = 8

export function isDerivedLinksKey(itemKey: string): boolean {
  return (NAV_MENU_DERIVED_KEYS as readonly string[]).includes(
    itemKey.trim().toLowerCase(),
  )
}
