/**
 * Hamburger nav menu — the website's fixed sections and the full-screen
 * background photo behind each one. The CMS only stores the photo: the section
 * list, labels and hrefs all live in the website's static nav config, so the
 * write contract is just `imageUrl` (+ `active` to hide a photo).
 *
 * `labelCkb`/`labelKmr`/`href` come back as read-only reference data so the
 * dashboard can show which menu link each row is. The backend omits null fields
 * rather than returning them as `null`, so every optional value is normalized
 * to an explicit `null` by `lib/nav-menu-normalize.ts` before it reaches the UI.
 */

export type ApiResponse<T> = {
  success: boolean
  message: string
  data?: T
}

export type NavMenuItemDto = {
  id: number | null
  /** Immutable handle joining the row to a section in the website's nav config. */
  itemKey: string
  labelCkb: string
  labelKmr: string | null
  href: string
  imageUrl: string | null
  displayOrder: number
  active: boolean
}

export type NavMenuListResponse = ApiResponse<NavMenuItemDto[]>
export type NavMenuSingleResponse = ApiResponse<NavMenuItemDto>
