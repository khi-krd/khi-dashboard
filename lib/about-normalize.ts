import type {
  AboutBlockDto,
  AboutBlockType,
  AboutDto,
  AboutPage,
  AboutStatus,
  GalleryImageDto,
  ImageAlignment,
  Language,
} from "@/types/about"

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

function normalizeLanguages(raw: unknown): Language[] {
  if (!raw) return ["CKB"]
  if (raw instanceof Set) return [...raw] as Language[]
  if (Array.isArray(raw)) {
    return raw.filter((x): x is Language => x === "CKB" || x === "KMR")
  }
  return ["CKB"]
}

function normalizeBlockType(raw: unknown): AboutBlockType {
  const t = coerceStr(raw)?.toUpperCase()
  const allowed = [
    "TEXT",
    "IMAGE",
    "VIDEO",
    "AUDIO",
    "GALLERY",
    "QUOTE",
    "STAT",
  ] as const
  if (allowed.includes(t as AboutBlockType)) return t as AboutBlockType
  return "TEXT"
}

function normalizeStatus(raw: unknown): AboutStatus {
  const s = coerceStr(raw)?.toUpperCase()
  if (s === "ACTIVE" || s === "ARCHIVED" || s === "DRAFT") return s
  return "DRAFT"
}

function normalizeAlignment(raw: unknown): ImageAlignment | null {
  const a = coerceStr(raw)?.toLowerCase()
  if (a === "center" || a === "wide" || a === "full") return a
  return null
}

function normalizeGalleryImage(raw: unknown): GalleryImageDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  return {
    id: coerceNum(o.id) ?? undefined,
    imageUrl: coerceStr(o.imageUrl) ?? coerceStr(o.image_url),
    sortOrder: coerceNum(o.sortOrder) ?? coerceNum(o.sort_order) ?? undefined,
  }
}

function normalizeBlock(raw: unknown, index: number): AboutBlockDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const images = Array.isArray(o.images)
    ? o.images.map(normalizeGalleryImage)
    : Array.isArray(o.galleryImages)
      ? o.galleryImages.map(normalizeGalleryImage)
      : []

  return {
    id: coerceNum(o.id) ?? coerceStr(o.id) ?? `block-${index}`,
    type: normalizeBlockType(o.type ?? o.blockType ?? o.block_type),
    sortOrder: coerceNum(o.sortOrder) ?? coerceNum(o.sort_order) ?? index,
    contentLanguages: normalizeLanguages(o.contentLanguages ?? o.content_languages),
    headingCkb: coerceStr(o.headingCkb) ?? coerceStr(o.heading_ckb),
    headingKmr: coerceStr(o.headingKmr) ?? coerceStr(o.heading_kmr),
    bodyCkb: coerceStr(o.bodyCkb) ?? coerceStr(o.body_ckb),
    bodyKmr: coerceStr(o.bodyKmr) ?? coerceStr(o.body_kmr),
    imageUrl: coerceStr(o.imageUrl) ?? coerceStr(o.image_url),
    captionCkb: coerceStr(o.captionCkb) ?? coerceStr(o.caption_ckb),
    captionKmr: coerceStr(o.captionKmr) ?? coerceStr(o.caption_kmr),
    alignment: normalizeAlignment(o.alignment),
    embedUrl: coerceStr(o.embedUrl) ?? coerceStr(o.embed_url),
    audioUrl: coerceStr(o.audioUrl) ?? coerceStr(o.audio_url),
    titleCkb: coerceStr(o.titleCkb) ?? coerceStr(o.title_ckb),
    titleKmr: coerceStr(o.titleKmr) ?? coerceStr(o.title_kmr),
    durationSeconds:
      coerceNum(o.durationSeconds) ?? coerceNum(o.duration_seconds),
    images,
    textCkb: coerceStr(o.textCkb) ?? coerceStr(o.text_ckb),
    textKmr: coerceStr(o.textKmr) ?? coerceStr(o.text_kmr),
    attributionCkb:
      coerceStr(o.attributionCkb) ?? coerceStr(o.attribution_ckb),
    attributionKmr:
      coerceStr(o.attributionKmr) ?? coerceStr(o.attribution_kmr),
    value: coerceStr(o.value) ?? (o.value != null ? String(o.value) : null),
    unitCkb: coerceStr(o.unitCkb) ?? coerceStr(o.unit_ckb),
    unitKmr: coerceStr(o.unitKmr) ?? coerceStr(o.unit_kmr),
    labelCkb: coerceStr(o.labelCkb) ?? coerceStr(o.label_ckb),
    labelKmr: coerceStr(o.labelKmr) ?? coerceStr(o.label_kmr),
  }
}

export function unwrapApiData<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in raw) {
    const envelope = raw as { success?: boolean; data?: T }
    if (envelope.data != null) return envelope.data
  }
  return raw as T
}

export function normalizeAboutDto(raw: unknown): AboutDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const blocksRaw = o.blocks ?? o.contentBlocks ?? o.content_blocks
  const blocks = Array.isArray(blocksRaw)
    ? blocksRaw
        .map((b, i) => normalizeBlock(b, i))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : []

  return {
    id: coerceNum(o.id) ?? undefined,
    status: normalizeStatus(o.status),
    slugCkb: coerceStr(o.slugCkb) ?? coerceStr(o.slug_ckb),
    slugKmr: coerceStr(o.slugKmr) ?? coerceStr(o.slug_kmr),
    titleCkb: coerceStr(o.titleCkb) ?? coerceStr(o.title_ckb),
    titleKmr: coerceStr(o.titleKmr) ?? coerceStr(o.title_kmr),
    subtitleCkb: coerceStr(o.subtitleCkb) ?? coerceStr(o.subtitle_ckb),
    subtitleKmr: coerceStr(o.subtitleKmr) ?? coerceStr(o.subtitle_kmr),
    seoDescriptionCkb:
      coerceStr(o.seoDescriptionCkb) ??
      coerceStr(o.seo_description_ckb) ??
      coerceStr(o.metaDescriptionCkb) ??
      coerceStr(o.meta_description_ckb),
    seoDescriptionKmr:
      coerceStr(o.seoDescriptionKmr) ??
      coerceStr(o.seo_description_kmr) ??
      coerceStr(o.metaDescriptionKmr) ??
      coerceStr(o.meta_description_kmr),
    heroImageUrl:
      coerceStr(o.heroImageUrl) ??
      coerceStr(o.hero_image_url) ??
      coerceStr(o.heroImage) ??
      coerceStr(o.hero_image),
    blocks,
    contentLanguages: normalizeLanguages(o.contentLanguages ?? o.content_languages),
    createdAt: coerceStr(o.createdAt) ?? coerceStr(o.created_at) ?? undefined,
    updatedAt: coerceStr(o.updatedAt) ?? coerceStr(o.updated_at) ?? undefined,
  }
}

export function normalizeAboutPage(raw: unknown): AboutPage {
  const unwrapped = unwrapApiData<unknown>(raw)
  const o = (unwrapped && typeof unwrapped === "object"
    ? unwrapped
    : {}) as Record<string, unknown>

  const contentRaw =
    o.content ?? o.items ?? o.data ?? (Array.isArray(unwrapped) ? unwrapped : [])
  const content = Array.isArray(contentRaw)
    ? contentRaw.map(normalizeAboutDto)
    : []

  return {
    content,
    totalElements: coerceNum(o.totalElements) ?? coerceNum(o.total_elements) ?? content.length,
    totalPages: coerceNum(o.totalPages) ?? coerceNum(o.total_pages) ?? 1,
    number: coerceNum(o.number) ?? coerceNum(o.page) ?? 0,
    size: coerceNum(o.size) ?? content.length,
  }
}
