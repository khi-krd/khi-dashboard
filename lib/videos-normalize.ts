import type {
  Language,
  TopicDto,
  VideoClipItemDto,
  VideoContentDto,
  VideoDto,
  VideoPage,
} from "@/types/videos"

function coerceStr(v: unknown): string | null {
  if (v == null) return null
  if (typeof v === "string") return v
  return String(v)
}

function coerceNum(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function coerceBool(v: unknown): boolean {
  if (v === true || v === "true" || v === 1) return true
  return false
}

function normalizeContent(raw: unknown): VideoContentDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  return {
    title: coerceStr(o.title) ?? undefined,
    description: coerceStr(o.description) ?? undefined,
    location: coerceStr(o.location) ?? undefined,
    director: coerceStr(o.director) ?? undefined,
    producer: coerceStr(o.producer) ?? undefined,
  }
}

function normalizeClip(raw: unknown): VideoClipItemDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >
  return {
    id: coerceNum(o.id) ?? undefined,
    url: coerceStr(o.url) ?? coerceStr(o.sourceUrl),
    externalUrl: coerceStr(o.externalUrl) ?? coerceStr(o.external_url),
    embedUrl: coerceStr(o.embedUrl) ?? coerceStr(o.embed_url),
    clipNumber: coerceNum(o.clipNumber) ?? coerceNum(o.clip_number) ?? undefined,
    durationSeconds:
      coerceNum(o.durationSeconds) ?? coerceNum(o.duration_seconds),
    resolution: coerceStr(o.resolution),
    fileFormat: coerceStr(o.fileFormat) ?? coerceStr(o.file_format),
    fileSizeMb: coerceNum(o.fileSizeMb) ?? coerceNum(o.file_size_mb) ?? undefined,
    titleCkb: coerceStr(o.titleCkb) ?? coerceStr(o.title_ckb),
    titleKmr: coerceStr(o.titleKmr) ?? coerceStr(o.title_kmr),
    descriptionCkb:
      coerceStr(o.descriptionCkb) ?? coerceStr(o.description_ckb),
    descriptionKmr:
      coerceStr(o.descriptionKmr) ?? coerceStr(o.description_kmr),
  }
}

function normalizeLanguages(raw: unknown): Language[] {
  if (!raw) return ["CKB"]
  if (raw instanceof Set) return [...raw] as Language[]
  if (Array.isArray(raw)) {
    return raw.filter((x): x is Language => x === "CKB" || x === "KMR")
  }
  return ["CKB"]
}

export function normalizeVideoDto(raw: unknown): VideoDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const clips = Array.isArray(o.videoClipItems)
    ? o.videoClipItems.map(normalizeClip)
    : Array.isArray(o.video_clip_items)
      ? o.video_clip_items.map(normalizeClip)
      : []

  return {
    id: coerceNum(o.id) ?? undefined,
    videoType:
      o.videoType === "VIDEO_CLIP" || o.video_type === "VIDEO_CLIP"
        ? "VIDEO_CLIP"
        : "FILM",
    albumOfMemories:
      coerceBool(o.albumOfMemories) || coerceBool(o.album_of_memories),
    topicId: coerceNum(o.topicId) ?? coerceNum(o.topic_id),
    topicNameCkb:
      coerceStr(o.topicNameCkb) ?? coerceStr(o.topic_name_ckb),
    topicNameKmr:
      coerceStr(o.topicNameKmr) ?? coerceStr(o.topic_name_kmr),
    ckbCoverUrl: coerceStr(o.ckbCoverUrl) ?? coerceStr(o.ckb_cover_url),
    kmrCoverUrl: coerceStr(o.kmrCoverUrl) ?? coerceStr(o.kmr_cover_url),
    hoverCoverUrl: coerceStr(o.hoverCoverUrl) ?? coerceStr(o.hover_cover_url),
    ckbContent: normalizeContent(o.ckbContent ?? o.ckb_content),
    kmrContent: normalizeContent(o.kmrContent ?? o.kmr_content),
    sourceUrl: coerceStr(o.sourceUrl) ?? coerceStr(o.source_url),
    sourceExternalUrl:
      coerceStr(o.sourceExternalUrl) ?? coerceStr(o.source_external_url),
    sourceEmbedUrl:
      coerceStr(o.sourceEmbedUrl) ?? coerceStr(o.source_embed_url),
    videoClipItems: clips.sort(
      (a, b) => (a.clipNumber ?? 0) - (b.clipNumber ?? 0),
    ),
    fileFormat: coerceStr(o.fileFormat) ?? coerceStr(o.file_format),
    durationSeconds:
      coerceNum(o.durationSeconds) ?? coerceNum(o.duration_seconds),
    publishmentDate:
      coerceStr(o.publishmentDate) ?? coerceStr(o.publishment_date),
    resolution: coerceStr(o.resolution),
    fileSizeMb: coerceNum(o.fileSizeMb) ?? coerceNum(o.file_size_mb),
    contentLanguages: normalizeLanguages(
      o.contentLanguages ?? o.content_languages,
    ),
    tagsCkb: Array.isArray(o.tagsCkb)
      ? o.tagsCkb.map(String)
      : Array.isArray(o.tags_ckb)
        ? o.tags_ckb.map(String)
        : [],
    tagsKmr: Array.isArray(o.tagsKmr)
      ? o.tagsKmr.map(String)
      : Array.isArray(o.tags_kmr)
        ? o.tags_kmr.map(String)
        : [],
    keywordsCkb: Array.isArray(o.keywordsCkb)
      ? o.keywordsCkb.map(String)
      : Array.isArray(o.keywords_ckb)
        ? o.keywords_ckb.map(String)
        : [],
    keywordsKmr: Array.isArray(o.keywordsKmr)
      ? o.keywordsKmr.map(String)
      : Array.isArray(o.keywords_kmr)
        ? o.keywords_kmr.map(String)
        : [],
    createdAt: coerceStr(o.createdAt) ?? coerceStr(o.created_at) ?? undefined,
    updatedAt: coerceStr(o.updatedAt) ?? coerceStr(o.updated_at) ?? undefined,
    createdBy: coerceStr(o.createdBy) ?? coerceStr(o.created_by),
    updatedBy: coerceStr(o.updatedBy) ?? coerceStr(o.updated_by),
  }
}

export function normalizeVideoPage(raw: unknown): VideoPage {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const content = Array.isArray(o.content)
    ? o.content.map(normalizeVideoDto)
    : []
  return {
    content,
    totalElements: coerceNum(o.totalElements) ?? coerceNum(o.total_elements) ?? content.length,
    totalPages: coerceNum(o.totalPages) ?? coerceNum(o.total_pages) ?? 1,
    size: coerceNum(o.size) ?? 20,
    number: coerceNum(o.number) ?? 0,
    first: coerceBool(o.first),
    last: coerceBool(o.last),
    empty: coerceBool(o.empty) || content.length === 0,
  }
}

export function normalizeTopicDto(raw: unknown): TopicDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  return {
    id: coerceNum(o.id) ?? 0,
    nameCkb: coerceStr(o.nameCkb) ?? coerceStr(o.name_ckb),
    nameKmr: coerceStr(o.nameKmr) ?? coerceStr(o.name_kmr),
    createdAt: coerceStr(o.createdAt) ?? coerceStr(o.created_at) ?? undefined,
    updatedAt: coerceStr(o.updatedAt) ?? coerceStr(o.updated_at) ?? undefined,
  }
}
