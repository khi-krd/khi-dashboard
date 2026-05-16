import type { ProjectDto, ProjectMediaDto, ProjectMediaType } from "@/types/projects"

const MEDIA_TYPES = new Set<ProjectMediaType>([
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "PDF",
  "DOCUMENT",
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

export function normalizeProjectMediaDto(raw: unknown): ProjectMediaDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const rawType = o.mediaType ?? o.type

  let mediaType: ProjectMediaType | null = null
  if (
    typeof rawType === "string" &&
    MEDIA_TYPES.has(rawType as ProjectMediaType)
  ) {
    mediaType = rawType as ProjectMediaType
  }
  if (!mediaType) return null

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
    null

  const externalUrl =
    coerceStr(o.externalUrl) ??
    coerceStr(o.external_url) ??
    null

  const embedUrl =
    coerceStr(o.embedUrl) ??
    coerceStr(o.embed_url) ??
    null

  const caption = coerceStr(o.caption)

  return {
    ...(typeof id === "number" && id > 0 ? { id } : {}),
    mediaType,
    url,
    externalUrl,
    embedUrl,
    caption,
    ...(typeof sortOrder === "number" ? { sortOrder } : {}),
    ...(typeof o.createdAt === "string" ? { createdAt: o.createdAt } : {}),
  }
}

export function normalizeProjectMediaList(raw: unknown): ProjectMediaDto[] {
  if (!Array.isArray(raw)) return []
  const out = raw
    .map(normalizeProjectMediaDto)
    .filter((m): m is ProjectMediaDto => m != null)
  return dedupeProjectMediaById(out)
}

export function dedupeProjectMediaById(
  media: ProjectMediaDto[],
): ProjectMediaDto[] {
  const sorted = [...media].sort((a, b) => {
    const da = typeof a.sortOrder === "number" ? a.sortOrder : 9999
    const db = typeof b.sortOrder === "number" ? b.sortOrder : 9999
    return da - db
  })
  const seen = new Set<number>()
  const out: ProjectMediaDto[] = []
  for (const m of sorted) {
    if (typeof m.id === "number" && m.id > 0) {
      if (seen.has(m.id)) continue
      seen.add(m.id)
    }
    out.push(m)
  }
  return out
}

function normalizeContentLanguages(raw: unknown): ProjectDto["contentLanguages"] {
  if (Array.isArray(raw)) {
    return raw.filter((l): l is "CKB" | "KMR" => l === "CKB" || l === "KMR")
  }
  if (raw instanceof Set) {
    return [...raw].filter((l): l is "CKB" | "KMR" => l === "CKB" || l === "KMR")
  }
  return ["CKB"]
}

export function normalizeProjectDto(d: ProjectDto): ProjectDto {
  return {
    ...d,
    status: d.status === "COMPLETED" ? "COMPLETED" : "ONGOING",
    contentLanguages: normalizeContentLanguages(d.contentLanguages),
    media: normalizeProjectMediaList(d.media),
    contentsCkb: Array.isArray(d.contentsCkb) ? d.contentsCkb : [],
    contentsKmr: Array.isArray(d.contentsKmr) ? d.contentsKmr : [],
    tagsCkb: Array.isArray(d.tagsCkb) ? d.tagsCkb : [],
    tagsKmr: Array.isArray(d.tagsKmr) ? d.tagsKmr : [],
    keywordsCkb: Array.isArray(d.keywordsCkb) ? d.keywordsCkb : [],
    keywordsKmr: Array.isArray(d.keywordsKmr) ? d.keywordsKmr : [],
  }
}
