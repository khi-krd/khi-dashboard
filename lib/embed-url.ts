import { watchToEmbedUrl } from "@/lib/video-url-helpers"

/**
 * Embed/iframe URL helpers shared by every media form (sound files, media
 * galleries, service gallery, tiptap inserts).
 *
 * Users paste three shapes:
 *   1. a raw page URL       — https://soundcloud.com/artist/track
 *   2. a provider embed URL — https://w.soundcloud.com/player/?url=…
 *   3. full <iframe> markup — <iframe src="…"></iframe>
 * All three normalize to a plain embed URL the public site can iframe.
 */

const IFRAME_SRC_RE = /<iframe[^>]+src=["']([^"']+)["']/i

/** Pull the src out of pasted <iframe> markup; pass plain URLs through. */
export function extractIframeSrc(input: string | null | undefined): string {
  const raw = input?.trim() ?? ""
  if (!raw) return ""
  if (!raw.includes("<")) return raw
  return raw.match(IFRAME_SRC_RE)?.[1]?.trim() ?? raw
}

/** True when the pasted value is embed markup rather than a plain URL. */
export function isIframeMarkup(input: string | null | undefined): boolean {
  return IFRAME_SRC_RE.test(input ?? "")
}

function hostOf(raw: string): string | null {
  try {
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw)
      ? raw
      : `https://${raw}`
    return new URL(withScheme).hostname.toLowerCase()
  } catch {
    return null
  }
}

const SOUNDCLOUD_HOSTS = /(^|\.)soundcloud\.com$/i
const SPOTIFY_HOSTS = /(^|\.)open\.spotify\.com$/i
const MIXCLOUD_HOSTS = /(^|\.)mixcloud\.com$/i
const AUDIOMACK_HOSTS = /(^|\.)audiomack\.com$/i

/**
 * Normalize an audio platform link or pasted iframe code into the provider's
 * iframe embed URL. Returns null when the platform isn't embeddable — callers
 * then keep the raw link as `externalUrl` instead.
 */
export function toAudioEmbedUrl(input: string | null | undefined): string | null {
  const src = extractIframeSrc(input)
  if (!src) return null

  // A pasted iframe src is already an embed URL — trust it as-is.
  if (isIframeMarkup(input)) return src

  const host = hostOf(src)
  if (!host) return null

  // Video platforms share the video embed mapper.
  const videoEmbed = watchToEmbedUrl(src)
  if (videoEmbed) return videoEmbed

  try {
    const url = new URL(/^https?:\/\//i.test(src) ? src : `https://${src}`)

    if (SOUNDCLOUD_HOSTS.test(host)) {
      // Already a player URL (w.soundcloud.com/player?url=…).
      if (host.startsWith("w.") || url.pathname.startsWith("/player"))
        return src
      // A track/set page embeds via the widget player's `url` parameter.
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(src)}&visual=false`
    }

    if (SPOTIFY_HOSTS.test(host)) {
      // open.spotify.com/<type>/<id> → /embed/<type>/<id>
      if (url.pathname.startsWith("/embed/")) return src
      const parts = url.pathname.split("/").filter(Boolean)
      if (parts.length >= 2)
        return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}`
      return null
    }

    if (MIXCLOUD_HOSTS.test(host)) {
      // mixcloud.com/<user>/<show> → widget iframe
      if (url.pathname.startsWith("/widget/iframe")) return src
      return `https://www.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(url.pathname)}&hide_cover=1`
    }

    if (AUDIOMACK_HOSTS.test(host)) {
      // audiomack.com/<type>/<slug> → /embed/<type>/<slug>
      if (url.pathname.startsWith("/embed/")) return src
      const parts = url.pathname.split("/").filter(Boolean)
      if (parts.length >= 2)
        return `https://audiomack.com/embed/${parts[0]}/${parts[1]}`
      return null
    }
  } catch {
    return null
  }

  // Unknown hosts: a URL that already looks like an embed/player path can be
  // iframed directly; anything else is not embeddable.
  if (/\/(embed|player|widget)\b/i.test(src)) return src
  return null
}
