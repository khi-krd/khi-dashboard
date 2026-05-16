import type { MediaDto, NewsDto } from "@/types/news"

type NewsMediaType = MediaDto["type"]

const MEDIA_TYPES = new Set<NewsMediaType>([
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "DOCUMENT",
  "OTHER",
])

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

/**
 * Normalize one media shape from the API — Jackson may omit vs default config,
 * and some gateways use snake_case (`external_url`) or alternate id keys (`mediaId`).
 */
export function normalizeMediaDto(raw: unknown): MediaDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const rawType = o.type

  let typeStr: NewsMediaType | null = null
  if (
    typeof rawType === "string" &&
    MEDIA_TYPES.has(rawType as NewsMediaType)
  ) {
    typeStr = rawType as NewsMediaType
  }
  if (!typeStr) return null

  const id =
    coerceInt(o.id) ??
    coerceInt(o.mediaId) ??
    coerceInt(o.media_id) ??
    undefined

  const sortOrder =
    coerceInt(o.sortOrder) ??
    coerceInt(o.sort_order) ??
    coerceInt(o.position) ??
    undefined

  const url =
    coerceStr(o.url) ??
    coerceStr(o.fileUrl) ??
    coerceStr(o.file_url) ??
    coerceStr(o.cdnUrl) ??
    coerceStr(o.cdn_url) ??
    null

  const externalUrl =
    coerceStr(o.externalUrl) ??
    coerceStr(o.external_url) ??
    coerceStr(o.sourceUrl) ??
    null

  const embedUrl =
    coerceStr(o.embedUrl) ??
    coerceStr(o.embed_url) ??
    coerceStr(o.embedURL) ??
    null

  return {
    ...(typeof id === "number" && id > 0 ? { id } : {}),
    type: typeStr,
    url,
    externalUrl,
    embedUrl,
    ...(typeof sortOrder === "number" ? { sortOrder } : {}),
    ...(typeof o.createdAt === "string" ? { createdAt: o.createdAt } : {}),
  }
}

export function normalizeNewsMediaList(raw: unknown): MediaDto[] {
  if (!Array.isArray(raw)) return []
  const out = raw
    .map(normalizeMediaDto)
    .filter((m): m is MediaDto => m != null)
  return dedupeMediaById(out)
}

/** If the backend ever returns duplicated rows sharing the same id, keep first (by sortOrder). */
export function dedupeMediaById(media: MediaDto[]): MediaDto[] {
  const sorted = [...media].sort((a, b) => {
    const da = typeof a.sortOrder === "number" ? a.sortOrder : 9999
    const db = typeof b.sortOrder === "number" ? b.sortOrder : 9999
    return da - db
  })
  const seen = new Set<number>()
  const out: MediaDto[] = []
  for (const m of sorted) {
    if (typeof m.id === "number" && m.id > 0) {
      if (seen.has(m.id)) continue
      seen.add(m.id)
    }
    out.push(m)
  }
  return out
}

export function normalizeNewsDto(d: NewsDto): NewsDto {
  return {
    ...d,
    media: normalizeNewsMediaList(d.media),
  }
}
