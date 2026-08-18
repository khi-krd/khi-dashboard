import { soundKeys } from "@/lib/sounds-query-keys"
import { videoKeys } from "@/lib/videos-query-keys"

/**
 * The two singleton promo videos: the Sound section's and the homepage Film
 * section's. The endpoints are deliberate twins — same shape, same singleton
 * rule, same POST-then-PATCH flow — so one config drives one screen rather
 * than two near-copies drifting apart.
 *
 * They differ in exactly four places, all captured here.
 */
export type ReklamVideoKind = "sound" | "film"

export type ReklamVideoConfig = {
  kind: ReklamVideoKind
  basePath: string
  /**
   * The backend's own keys. Branched on instead of the message, which is
   * translated per request and changes with `Accept-Language`.
   */
  alreadyExistsKey: string
  notFoundKey: string
  /**
   * The client-side size ceiling. Neither API enforces one — the only server
   * limit is Spring's multipart cap — so this is the only thing between an
   * editor and a hundred-megabyte background loop.
   */
  maxBytes: number
  accept: string
  queryKey: readonly unknown[]
}

export const SOUND_REKLAM_VIDEO: ReklamVideoConfig = {
  kind: "sound",
  basePath: "/api/v1/sound-tracks/sound-reklam-video",
  alreadyExistsKey: "sound.reklamVideo.already_exists",
  notFoundKey: "sound.reklamVideo.not_found",
  maxBytes: 500 * 1024 * 1024,
  accept: "video/mp4,video/webm,video/quicktime,video/*",
  queryKey: soundKeys.reklamVideo(),
}

export const FILM_REKLAM_VIDEO: ReklamVideoConfig = {
  kind: "film",
  basePath: "/api/v1/videos/film-reklam-video",
  alreadyExistsKey: "video.reklamVideo.already_exists",
  notFoundKey: "video.reklamVideo.not_found",
  // Two orders of magnitude below the sound ceiling, on purpose. This one
  // autoplays behind the homepage film cards on every visit, so its weight is
  // paid by every visitor rather than by whoever presses play. The reference
  // file is ~7 MB.
  maxBytes: 8 * 1024 * 1024,
  // MP4 only. It has to autoplay muted and loop in every browser, and that is
  // the one container all of them agree on.
  accept: "video/mp4",
  queryKey: videoKeys.filmReklamVideo(),
}
