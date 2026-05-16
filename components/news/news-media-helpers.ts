/** YouTube / Vimeo helpers for video tiles (no URL shown in UI). */

export function extractVimeoId(url: string | undefined | null): string | null {
  if (!url) return null
  const u = url.trim()
  const player = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (player?.[1]) return player[1]
  const channel = u.match(/player\.vimeo\.com\/video\/(\d+)/i)
  if (channel?.[1]) return channel[1]
  return null
}

/** Best-effort static thumb for Vimeo tiles (no network). */
export function vimeoPosterUrl(videoId: string): string {
  return `https://vumbnail.com/${videoId}`
}

export function extractYoutubeId(url: string | undefined | null): string | null {
  if (!url) return null
  const u = url.trim()
  const embed = u.match(/youtube\.com\/embed\/([\w-]{11})/i)
  if (embed?.[1]) return embed[1]
  const short = u.match(/youtu\.be\/([\w-]{11})/i)
  if (short?.[1]) return short[1]
  const watch = u.match(/[?&]v=([\w-]{11})/i)
  if (watch?.[1]) return watch[1]
  return null
}

export function youtubeThumb(url: string | undefined | null) {
  const id = extractYoutubeId(url ?? undefined)
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null
}

export function newsUrlPublic(id: number) {
  const base = (
    process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ""
  ).replace(/\/+$/, "")
  if (!base) return ""
  return `${base}/news/${id}`
}
