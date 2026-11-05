/**
 * The clips of the donate page's archive-donors section — short videos of the
 * people who handed their archive material over to the institute, edited from
 * the dashboard and read by the website.
 *
 * Rows are drawn sorted by `displayOrder`; `active: false` hides a row on the
 * site without deleting it. `videoUrl` may be an uploaded file (R2) or a
 * YouTube link — the site's player resolves both. `posterUrl` is the optional
 * still image shown before playback starts.
 *
 * As elsewhere in this API optional fields come back absent rather than as
 * `null`, so `lib/donation-archive-video-normalize.ts` fills each one in
 * explicitly before it reaches the UI.
 */

export type DonationArchiveVideoDto = {
  /** Null only for rows the editor has added but not saved yet. */
  id: number | null
  titleCkb: string | null
  titleKmr: string | null
  descriptionCkb: string | null
  descriptionKmr: string | null
  /** Required — the clip itself: an uploaded file URL or a YouTube link. */
  videoUrl: string
  /** Optional still shown before playback; empty means the player picks. */
  posterUrl: string | null
  displayOrder: number
  active: boolean
}

/** Checked client-side so the API never has to. */
export const DONATION_ARCHIVE_VIDEO_TITLE_MAX = 300
export const DONATION_ARCHIVE_VIDEO_DESCRIPTION_MAX = 5000
export const DONATION_ARCHIVE_VIDEO_URL_MAX = 1500

/** The backend stores a blank `videoUrl` as "" — the dialog blocks it instead. */
export function hasAnyTitle(
  video: Pick<DonationArchiveVideoDto, "titleCkb" | "titleKmr">,
): boolean {
  return Boolean(video.titleCkb?.trim() || video.titleKmr?.trim())
}
