export {
  extractVimeoId,
  extractYoutubeId,
  vimeoPosterUrl,
  youtubeThumb,
} from "@/components/news/news-media-helpers"

export function projectUrlPublic(id: number) {
  const base = (
    process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ""
  ).replace(/\/+$/, "")
  if (!base) return ""
  return `${base}/projects/${id}`
}
