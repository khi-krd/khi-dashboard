/**
 * One entry of the site typeface library (`/api/v1/site-fonts`).
 *
 * The library can hold several uploaded fonts per language; which one is live
 * is decided by `site_settings.ckbFontUrl` / `kmrFontUrl` — activation is a
 * normal site-settings update carrying this row's url + name.
 */
export type SiteFontLanguage = "CKB" | "KMR"

export type SiteFontDto = {
  id: number
  language: SiteFontLanguage
  /** Display label ("Rabar", "NRT"…). */
  name: string
  /** Public URL of the uploaded file in the media bucket. */
  url: string
  createdAt: string | null
}

export type SiteFontPayload = {
  language: SiteFontLanguage
  name: string
  url: string
}
