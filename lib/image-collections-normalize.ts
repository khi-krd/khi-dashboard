import type {
  CollectionContentDto,
  CollectionDto,
  CollectionPage,
  CollectionType,
  ImageAlbumItemDto,
  Language,
  TopicDto,
} from "@/types/image-collections"
import { parseFeaturedFields } from "@/lib/featured-fields"

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

function coerceStringArray(raw: unknown): string[] {
  if (!raw) return []
  if (raw instanceof Set) return [...raw].map(String)
  if (Array.isArray(raw)) return raw.map(String)
  return []
}

function normalizeContent(raw: unknown): CollectionContentDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  return {
    title: coerceStr(o.title) ?? undefined,
    description: coerceStr(o.description) ?? undefined,
    location: coerceStr(o.location) ?? undefined,
    collectedBy:
      coerceStr(o.collectedBy) ?? coerceStr(o.collected_by) ?? undefined,
  }
}

function normalizeAlbumItem(raw: unknown): ImageAlbumItemDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  return {
    id: coerceNum(o.id) ?? undefined,
    imageUrl: coerceStr(o.imageUrl) ?? coerceStr(o.image_url),
    externalUrl: coerceStr(o.externalUrl) ?? coerceStr(o.external_url),
    embedUrl: coerceStr(o.embedUrl) ?? coerceStr(o.embed_url),
    captionCkb: coerceStr(o.captionCkb) ?? coerceStr(o.caption_ckb),
    captionKmr: coerceStr(o.captionKmr) ?? coerceStr(o.caption_kmr),
    descriptionCkb:
      coerceStr(o.descriptionCkb) ?? coerceStr(o.description_ckb),
    descriptionKmr:
      coerceStr(o.descriptionKmr) ?? coerceStr(o.description_kmr),
    sortOrder: coerceNum(o.sortOrder) ?? coerceNum(o.sort_order) ?? undefined,
    fileSizeBytes:
      coerceNum(o.fileSizeBytes) ?? coerceNum(o.file_size_bytes),
    widthPx: coerceNum(o.widthPx) ?? coerceNum(o.width_px),
    heightPx: coerceNum(o.heightPx) ?? coerceNum(o.height_px),
    mimeType: coerceStr(o.mimeType) ?? coerceStr(o.mime_type),
    aspectRatio: coerceNum(o.aspectRatio) ?? coerceNum(o.aspect_ratio),
    humanReadableSize:
      coerceStr(o.humanReadableSize) ?? coerceStr(o.human_readable_size),
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

function normalizeTags(raw: unknown, ckbKey: string, kmrKey: string): {
  tagsCkb: string[]
  tagsKmr: string[]
} {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  if (Array.isArray(raw)) {
    return { tagsCkb: raw.map(String), tagsKmr: [] }
  }
  const ckb = o.ckb ?? o[ckbKey]
  const kmr = o.kmr ?? o[kmrKey]
  return {
    tagsCkb: coerceStringArray(ckb),
    tagsKmr: coerceStringArray(kmr),
  }
}

function normalizeCollectionType(raw: unknown): CollectionType {
  const t = coerceStr(raw)
  if (t === "SINGLE" || t === "GALLERY" || t === "PHOTO_STORY") return t
  const snake = coerceStr((raw as Record<string, unknown>)?.collection_type)
  if (snake === "SINGLE" || snake === "GALLERY" || snake === "PHOTO_STORY") {
    return snake
  }
  return "GALLERY"
}

export function unwrapApiData<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in raw) {
    const envelope = raw as { success?: boolean; data?: T }
    if (envelope.data != null) return envelope.data
  }
  return raw as T
}

export function normalizeCollectionDto(raw: unknown): CollectionDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>

  const album = Array.isArray(o.imageAlbum)
    ? o.imageAlbum.map(normalizeAlbumItem)
    : Array.isArray(o.image_album)
      ? o.image_album.map(normalizeAlbumItem)
      : []

  const tagsFromBilingual = normalizeTags(o.tags, "tagsCkb", "tagsKmr")
  const keywordsFromBilingual = normalizeTags(o.keywords, "keywordsCkb", "keywordsKmr")

  return {
    id: coerceNum(o.id) ?? undefined,
    collectionType: normalizeCollectionType(
      o.collectionType ?? o.collection_type,
    ),
    topicId: coerceNum(o.topicId) ?? coerceNum(o.topic_id),
    topicNameCkb:
      coerceStr(o.topicNameCkb) ?? coerceStr(o.topic_name_ckb),
    topicNameKmr:
      coerceStr(o.topicNameKmr) ?? coerceStr(o.topic_name_kmr),
    ckbCoverUrl: coerceStr(o.ckbCoverUrl) ?? coerceStr(o.ckb_cover_url),
    kmrCoverUrl: coerceStr(o.kmrCoverUrl) ?? coerceStr(o.kmr_cover_url),
    hoverCoverUrl: coerceStr(o.hoverCoverUrl) ?? coerceStr(o.hover_cover_url),
    // Rebuilt field-by-field, so anything not listed here is silently dropped —
    // which is what hid the hero picture after it was saved.
    featureImageUrl:
      coerceStr(o.featureImageUrl) ?? coerceStr(o.feature_image_url),
    ckbContent: normalizeContent(o.ckbContent ?? o.ckb_content),
    kmrContent: normalizeContent(o.kmrContent ?? o.kmr_content),
    publishmentDate:
      coerceStr(o.publishmentDate) ?? coerceStr(o.publishment_date),
    contentLanguages: normalizeLanguages(
      o.contentLanguages ?? o.content_languages,
    ),
    tagsCkb:
      tagsFromBilingual.tagsCkb.length > 0
        ? tagsFromBilingual.tagsCkb
        : coerceStringArray(o.tagsCkb ?? o.tags_ckb),
    tagsKmr:
      tagsFromBilingual.tagsKmr.length > 0
        ? tagsFromBilingual.tagsKmr
        : coerceStringArray(o.tagsKmr ?? o.tags_kmr),
    keywordsCkb:
      keywordsFromBilingual.tagsCkb.length > 0
        ? keywordsFromBilingual.tagsCkb
        : coerceStringArray(o.keywordsCkb ?? o.keywords_ckb),
    keywordsKmr:
      keywordsFromBilingual.tagsKmr.length > 0
        ? keywordsFromBilingual.tagsKmr
        : coerceStringArray(o.keywordsKmr ?? o.keywords_kmr),
    imageAlbum: album.sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    ),
    createdAt: coerceStr(o.createdAt) ?? coerceStr(o.created_at) ?? undefined,
    updatedAt: coerceStr(o.updatedAt) ?? coerceStr(o.updated_at) ?? undefined,
    createdBy: coerceStr(o.createdBy) ?? coerceStr(o.created_by),
    updatedBy: coerceStr(o.updatedBy) ?? coerceStr(o.updated_by),
    ...parseFeaturedFields(o),
  }
}

export function normalizeCollectionPage(raw: unknown): CollectionPage {
  const unwrapped = unwrapApiData<unknown>(raw)
  const o = (unwrapped && typeof unwrapped === "object" ? unwrapped : {}) as Record<
    string,
    unknown
  >
  const content = Array.isArray(o.content)
    ? o.content.map(normalizeCollectionDto)
    : []
  return {
    content,
    totalElements:
      coerceNum(o.totalElements) ?? coerceNum(o.total_elements) ?? content.length,
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
