/**
 * Global social links — one row per platform, edited from the dashboard and
 * read by the website's contact page (and, once it is switched over, the
 * footer). Shape follows `SOCIAL_LINKS_BACKEND.md` §3.
 *
 * The API omits null fields rather than sending them as `null`, so every
 * optional value here is filled in explicitly by `lib/social-links-normalize.ts`
 * before it reaches the UI.
 */

export type SocialLinkDto = {
  /** Null only for rows the editor has added but not saved yet. */
  id: number | null
  /** Uppercase on the server — `FACEBOOK`, `INSTAGRAM`… Unique per row (§2). */
  platform: string
  url: string
  labelCkb: string | null
  labelKmr: string | null
  displayOrder: number
  active: boolean
}

/** Column widths from §2 — checked client-side so the API never has to (§4). */
export const SOCIAL_PLATFORM_MAX = 60
export const SOCIAL_URL_MAX = 2000
export const SOCIAL_LABEL_MAX = 200

/**
 * The four the website has icons for today (§7 rule 2). Anything else is stored
 * and returned by the API but stays invisible on the site until the website
 * side adds an icon, so the editor is warned rather than blocked.
 */
export const WEBSITE_RENDERED_PLATFORMS = [
  "FACEBOOK",
  "INSTAGRAM",
  "YOUTUBE",
  "WHATSAPP",
] as const

/**
 * Offered in the platform picker. The first four render on the site; the rest
 * are here so a key typed by hand cannot drift ("X" vs "TWITTER" vs "twitter")
 * before the website learns to draw them.
 */
export const SOCIAL_PLATFORM_CATALOG = [
  ...WEBSITE_RENDERED_PLATFORMS,
  "TIKTOK",
  "TELEGRAM",
  "TWITTER",
  "LINKEDIN",
  "SNAPCHAT",
  "THREADS",
  "PINTEREST",
  "SOUNDCLOUD",
  "SPOTIFY",
] as const

export type SocialPlatform = (typeof SOCIAL_PLATFORM_CATALOG)[number]

/** Same transform the server applies on save (§3), so the UI agrees with it. */
export function normalizePlatformKey(platform: string): string {
  return platform.trim().toUpperCase()
}

export function isWebsiteRenderedPlatform(platform: string): boolean {
  return (WEBSITE_RENDERED_PLATFORMS as readonly string[]).includes(
    normalizePlatformKey(platform),
  )
}

export function isCatalogPlatform(platform: string): boolean {
  return (SOCIAL_PLATFORM_CATALOG as readonly string[]).includes(
    normalizePlatformKey(platform),
  )
}
