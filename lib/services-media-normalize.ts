import type {
  ServiceCollectionFileDto,
  ServiceContentDto,
  ServiceDto,
  ServiceMediaCollectionDto,
  ServiceMediaType,
} from "@/types/services"

const MEDIA_TYPES = new Set<ServiceMediaType>(["IMAGE", "VIDEO", "AUDIO"])

function coerceInt(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v.trim())
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function coerceStr(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null
}

function coerceBool(v: unknown, fallback = true): boolean {
  if (typeof v === "boolean") return v
  if (v === "true" || v === true) return true
  if (v === "false" || v === false) return false
  return fallback
}

function normalizeFileContent(raw: unknown): ServiceCollectionFileDto["ckbContent"] {
  if (!raw || typeof raw !== "object") return undefined
  const o = raw as Record<string, unknown>
  return {
    caption: coerceStr(o.caption) ?? undefined,
    title: coerceStr(o.title) ?? undefined,
    description:
      typeof o.description === "string" ? o.description : undefined,
  }
}

export function normalizeCollectionFileDto(
  raw: unknown,
): ServiceCollectionFileDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const fileUrl =
    coerceStr(o.fileUrl) ?? coerceStr(o.file_url) ?? coerceStr(o.url)
  if (!fileUrl) return null

  return {
    id: coerceInt(o.id),
    fileUrl,
    thumbnailUrl:
      coerceStr(o.thumbnailUrl) ?? coerceStr(o.thumbnail_url) ?? undefined,
    ckbContent: normalizeFileContent(o.ckbContent ?? o.ckb_content),
    kmrContent: normalizeFileContent(o.kmrContent ?? o.kmr_content),
    sortOrder: coerceInt(o.sortOrder) ?? coerceInt(o.sort_order),
    fileFormat: coerceStr(o.fileFormat) ?? coerceStr(o.file_format) ?? undefined,
    widthPx: coerceInt(o.widthPx) ?? coerceInt(o.width_px),
    heightPx: coerceInt(o.heightPx) ?? coerceInt(o.height_px),
    resolution: coerceStr(o.resolution) ?? undefined,
    durationSeconds:
      coerceInt(o.durationSeconds) ?? coerceInt(o.duration_seconds),
    formattedDuration:
      coerceStr(o.formattedDuration) ??
      coerceStr(o.formatted_duration) ??
      undefined,
    codec: coerceStr(o.codec) ?? undefined,
    bitrateKbps: coerceInt(o.bitrateKbps) ?? coerceInt(o.bitrate_kbps),
    fileSize: coerceInt(o.fileSize) ?? coerceInt(o.file_size),
    formattedFileSize:
      coerceStr(o.formattedFileSize) ??
      coerceStr(o.formatted_file_size) ??
      undefined,
  }
}

export function normalizeMediaCollectionDto(
  raw: unknown,
): ServiceMediaCollectionDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const rawType = o.mediaType ?? o.media_type
  let mediaType: ServiceMediaType | null = null
  if (
    typeof rawType === "string" &&
    MEDIA_TYPES.has(rawType as ServiceMediaType)
  ) {
    mediaType = rawType as ServiceMediaType
  }
  if (!mediaType) return null

  const collectionName =
    coerceStr(o.collectionName) ?? coerceStr(o.collection_name) ?? ""
  if (!collectionName) return null

  const filesRaw = o.files ?? o.mediaFiles
  const files = Array.isArray(filesRaw)
    ? filesRaw
        .map(normalizeCollectionFileDto)
        .filter((f): f is ServiceCollectionFileDto => f != null)
    : []

  return {
    id: coerceInt(o.id),
    collectionName,
    mediaType,
    sortOrder: coerceInt(o.sortOrder) ?? coerceInt(o.sort_order),
    files,
  }
}

function normalizeContentDto(raw: unknown): ServiceContentDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const lang = o.languageCode ?? o.language_code
  if (lang !== "CKB" && lang !== "KMR") return null
  const title = coerceStr(o.title)
  if (!title) return null
  return {
    languageCode: lang,
    title,
    description:
      typeof o.description === "string" ? o.description : undefined,
  }
}

function normalizeContentsList(raw: unknown): ServiceContentDto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizeContentDto)
    .filter((c): c is ServiceContentDto => c != null)
}

function normalizeCollectionsList(
  raw: unknown,
): ServiceMediaCollectionDto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizeMediaCollectionDto)
    .filter((c): c is ServiceMediaCollectionDto => c != null)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export function normalizeServiceDto(d: ServiceDto): ServiceDto {
  const contents =
    d.contents?.length > 0 ? normalizeContentsList(d.contents) : []
  const mediaCollections = normalizeCollectionsList(
    d.mediaCollections ?? [],
  )
  const contentLanguages =
    d.contentLanguages?.filter((l): l is "CKB" | "KMR" => l === "CKB" || l === "KMR") ??
    contents.map((c) => c.languageCode)

  return {
    ...d,
    active: coerceBool(d.active, true),
    serviceType: d.serviceType?.trim() ?? "",
    location: d.location?.trim() || null,
    coverMediaUrl:
      coerceStr(d.coverMediaUrl) ?? coerceStr((d as { coverUrl?: string }).coverUrl),
    contents,
    mediaCollections,
    contentLanguages:
      contentLanguages.length > 0 ? contentLanguages : ["CKB"],
  }
}
