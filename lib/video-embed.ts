/**
 * Video link handling for previews and public rendering.
 *
 * Direct files (.mp4/.webm/…) play in a native <video> element. Links to
 * providers like YouTube or Vimeo can never play that way — they must go
 * through the provider's iframe embed. `toVideoEmbedUrl` converts a watch
 * page URL into its embeddable form; anything unrecognized returns null so
 * callers can fall back to a styled link card instead of a broken player.
 */

const VIDEO_FILE_EXT =
  /\.(mp4|webm|mov|m4v|ogv|ogg|avi|mkv|ts|m3u8|mpd)(\?|#|$)/i

const YOUTUBE_HOSTS = /(^|\.)((youtu\.be)|(youtube\.com)|(youtube-nocookie\.com))$/i
const VIMEO_HOSTS = /(^|\.)vimeo\.com$/i
const DAILYMOTION_HOSTS = /(^|\.)((dailymotion\.com)|(dai\.ly))$/i

function hostOf(url: string): string | null {
  try {
    // Tolerate missing scheme ("youtube.com/watch?v=…" or "youtu.be/…").
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`
    return new URL(withScheme).hostname.toLowerCase()
  } catch {
    return null
  }
}

export function toVideoEmbedUrl(rawUrl: string | null | undefined): string | null {
  const raw = rawUrl?.trim()
  if (!raw) return null
  const host = hostOf(raw)
  if (!host) return null

  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)

    if (YOUTUBE_HOSTS.test(host)) {
      // youtube-nocookie: the privacy-mode player — no tracking cookies, so the
      // cross-site GPS/YSC cookie rejections never fire in the console.
      if (host.endsWith("youtu.be")) {
        const id = url.pathname.replace(/^\//, "").split("/")[0]
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
      }
      // youtube.com/embed/ID and /shorts/ID and /live/ID already carry the id in the path.
      const pathId =
        url.pathname.match(/^\/(embed|shorts|live)\/([^/?#]+)/)?.[2] ?? null
      const id = url.searchParams.get("v") ?? pathId
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }

    if (VIMEO_HOSTS.test(host)) {
      const id = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1] ?? null
      return id ? `https://player.vimeo.com/video/${id}` : null
    }

    if (DAILYMOTION_HOSTS.test(host)) {
      const id =
        host.endsWith("dai.ly")
          ? url.pathname.replace(/^\//, "").split("/")[0]
          : (url.pathname.match(/\/video\/([^/?#]+)/)?.[1] ?? null)
      return id ? `https://www.dailymotion.com/embed/video/${id}` : null
    }
  } catch {
    return null
  }
  return null
}

/** True when the URL points at a directly playable video file. */
export function isDirectVideoFile(rawUrl: string | null | undefined): boolean {
  const raw = rawUrl?.trim()
  if (!raw) return false
  return VIDEO_FILE_EXT.test(raw)
}

export type VideoLinkKind = "embed" | "file" | "external"

/**
 * Classify a video URL for rendering:
 *  - "embed"    → provider iframe (YouTube/Vimeo/…)
 *  - "file"     → native <video> element
 *  - "external" → unknown page link — show a styled link card, never a player
 */
export function classifyVideoUrl(
  rawUrl: string | null | undefined,
): { kind: VideoLinkKind; src: string } | null {
  const raw = rawUrl?.trim()
  if (!raw) return null
  const embed = toVideoEmbedUrl(raw)
  if (embed) return { kind: "embed", src: embed }
  if (isDirectVideoFile(raw)) return { kind: "file", src: raw }
  return { kind: "external", src: raw }
}
