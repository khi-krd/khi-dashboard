import type { Language, VideoDto, VideoType } from "@/types/videos"

export type VideosUiTypeFilter = "all" | "film" | "clip" | "album"

export type VideosUiLanguageFilter =
  | "all"
  | "ckb_only"
  | "kmr_only"
  | "both"

export type VideosListQueryKeyParts = {
  page: number
  size: number
  keyword: string
  searchMode?: "tag" | "keyword" | "default"
}

export type VideoAdminTableRow = VideoDto & {
  clipCount: number
  titleCkb: string
  titleKmr: string
  sortPublishDate: number
  sortDuration: number
}

export function toVideoAdminRow(v: VideoDto): VideoAdminTableRow {
  const titleCkb = v.ckbContent?.title ?? ""
  const titleKmr = v.kmrContent?.title ?? ""
  const pub = v.publishmentDate
    ? new Date(v.publishmentDate).getTime()
    : v.createdAt
      ? new Date(v.createdAt).getTime()
      : 0
  return {
    ...v,
    clipCount: v.videoClipItems?.length ?? 0,
    titleCkb,
    titleKmr,
    sortPublishDate: Number.isFinite(pub) ? pub : 0,
    sortDuration: v.durationSeconds ?? 0,
  }
}

export function matchesVideoTypeFilter(
  v: VideoDto,
  filter: VideosUiTypeFilter,
): boolean {
  if (filter === "all") return true
  if (filter === "film") return v.videoType === "FILM"
  if (filter === "clip") {
    return v.videoType === "VIDEO_CLIP" && !v.albumOfMemories
  }
  if (filter === "album") {
    return v.videoType === "VIDEO_CLIP" && !!v.albumOfMemories
  }
  return true
}

export function matchesVideoTopicFilter(
  v: VideoDto,
  topicId: number | null,
): boolean {
  if (topicId == null) return true
  return v.topicId === topicId
}

export function matchesVideoLanguageFilter(
  v: VideoDto,
  filter: VideosUiLanguageFilter,
): boolean {
  const langs = normalizeLanguages(v.contentLanguages)
  const hasCkb = langs.includes("CKB")
  const hasKmr = langs.includes("KMR")
  if (filter === "all") return true
  if (filter === "ckb_only") return hasCkb && !hasKmr
  if (filter === "kmr_only") return hasKmr && !hasCkb
  if (filter === "both") return hasCkb && hasKmr
  return true
}

export function matchesVideoClientSearchFilter(
  v: VideoDto,
  q: string | null,
): boolean {
  const k = q?.trim().toLowerCase()
  if (!k || k.length < 2) return true
  const haystack = [
    v.ckbContent?.title,
    v.kmrContent?.title,
    ...(v.tagsCkb ?? []),
    ...(v.tagsKmr ?? []),
    ...(v.keywordsCkb ?? []),
    ...(v.keywordsKmr ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(k)
}

function normalizeLanguages(
  langs: Language[] | Set<Language> | undefined,
): Language[] {
  if (!langs) return []
  if (langs instanceof Set) return [...langs]
  return langs
}

export function getVideoTitleCkb(v: VideoDto): string {
  return v.ckbContent?.title?.trim() ?? ""
}

export function getVideoTitleKmr(v: VideoDto): string {
  return v.kmrContent?.title?.trim() ?? ""
}

export function getPrimarySourceType(
  v: VideoDto,
): "file" | "youtube" | "vimeo" | "embed" | "clips" | null {
  if (v.videoType === "VIDEO_CLIP") return "clips"
  if (v.sourceUrl?.trim()) return "file"
  if (v.sourceEmbedUrl?.trim()) return "embed"
  const ext = v.sourceExternalUrl?.trim() ?? ""
  if (!ext) return null
  if (/youtube|youtu\.be/i.test(ext)) return "youtube"
  if (/vimeo/i.test(ext)) return "vimeo"
  return "embed"
}
