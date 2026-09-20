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
  /**
   * Uploaded typeface for the Sorani pages. `null` → Vazirmatn keeps
   * rendering. `ckbFontName` is only the display label ("Rabar", "NRT").
   */
  ckbFontUrl: string | null
  ckbFontName: string | null
  /** Same pair for the Kurmanji (Latin-script) pages. `null` → Archivo. */
  kmrFontUrl: string | null
  kmrFontName: string | null
  /**
   * Admin-picked surface colors as hex strings. `null` → the website's
   * bundled token renders — which is also the reset path: clearing a field
   * restores the default look for that surface.
   */
  bodyColor: string | null
  navbarColor: string | null
  footerColor: string | null
  collectionColor: string | null
  /**
   * Type scales as percent strings (`"115"` = 115% of the bundled size).
   * `null` → the website's bundled scale renders — the reset path, same as
   * the colors. Title covers display/h1/h2/h3, body covers body/lead,
   * caption covers small/label.
   */
  titleFontScale: string | null
  bodyFontScale: string | null
  captionFontScale: string | null
  /** Same percent convention — drives the navbar's text size. */
  navFontScale: string | null
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
  ckbFontUrl?: string
  ckbFontName?: string
  kmrFontUrl?: string
  kmrFontName?: string
  bodyColor?: string
  navbarColor?: string
  footerColor?: string
  collectionColor?: string
  titleFontScale?: string
  bodyFontScale?: string
  captionFontScale?: string
  navFontScale?: string
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
