/**
 * Site-wide branding and global configuration — a singleton row.
 *
 * `GET` never 404s: with no row stored it answers with defaults, so the screen
 * always has something to render and `null` is a normal value rather than an
 * error. Both pictures have a working fallback on the website.
 */
export type SiteSettingsDto = {
  /** `null` until the first save creates the row. */
  id: number | null
  /** Header and footer logo. `null` → the website uses its bundled logo. */
  logoUrl: string | null
  /** Donate band photograph. `null` → the band renders on plain dark ground. */
  donateImageUrl: string | null
  /** Homepage carousel cap, `1`–`20`. Defaults to `7`. */
  maxFeaturedSlides: number
  updatedAt: string | null
}

/**
 * Every field is optional and tri-state, the same convention as the
 * `featureImageUrl` fields: omitted leaves the stored value alone, `""` clears
 * it, a value trims and stores it. `maxFeaturedSlides` has no clear form —
 * omit it to keep the current cap.
 */
export type SiteSettingsPayload = {
  logoUrl?: string
  donateImageUrl?: string
  maxFeaturedSlides?: number
}

export const DEFAULT_MAX_FEATURED_SLIDES = 7
export const MIN_MAX_FEATURED_SLIDES = 1
export const MAX_MAX_FEATURED_SLIDES = 20

/**
 * The bucket the website is built to load from. A URL on any other host is
 * stored happily by the API but will not appear on the site until it ships a
 * deploy that allows the host — worth warning about, not worth blocking.
 */
export const SITE_MEDIA_HOST = "s3-khiwebsite.s3.us-east-1.amazonaws.com"
