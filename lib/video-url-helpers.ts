export function extractVimeoId(url: string | undefined | null): string | null {
  if (!url) return null
  const u = url.trim()
  const player = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (player?.[1]) return player[1]
  const channel = u.match(/player\.vimeo\.com\/video\/(\d+)/i)
  if (channel?.[1]) return channel[1]
  return null
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

export function isYoutubeUrl(url: string | undefined | null): boolean {
  if (!url?.trim()) return false
  return /youtube|youtu\.be/i.test(url)
}

export function isVimeoUrl(url: string | undefined | null): boolean {
  if (!url?.trim()) return false
  return /vimeo/i.test(url)
}

export function watchToEmbedUrl(watchUrl: string): string | null {
  const yt = extractYoutubeId(watchUrl)
  if (yt) return `https://www.youtube.com/embed/${yt}`
  const vm = extractVimeoId(watchUrl)
  if (vm) return `https://player.vimeo.com/video/${vm}`
  return null
}

export type VideoProvider = "youtube" | "vimeo" | "other"

export function detectProvider(url: string | undefined | null): VideoProvider {
  if (!url?.trim()) return "other"
  if (isYoutubeUrl(url)) return "youtube"
  if (isVimeoUrl(url)) return "vimeo"
  return "other"
}

export function providerLabel(provider: VideoProvider): string {
  switch (provider) {
    case "youtube":
      return "یوتیوب"
    case "vimeo":
      return "ڤیمیۆ"
    default:
      return "سایت"
  }
}

export function youtubeThumb(url: string | undefined | null): string | null {
  const id = extractYoutubeId(url ?? undefined)
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null
}

export function vimeoPosterUrl(videoId: string): string {
  return `https://vumbnail.com/${videoId}`
}

export function videoUrlPublic(id: number) {
  const base = (
    process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ""
  ).replace(/\/+$/, "")
  if (!base) return ""
  return `${base}/videos/${id}`
}

export function mimeFromFormat(format: string | undefined | null): string {
  const f = (format ?? "mp4").toLowerCase().replace(/^\./, "")
  const map: Record<string, string> = {
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
  }
  return map[f] ?? "video/mp4"
}
