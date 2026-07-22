import type {
  ServiceContentDto,
  ServiceDto,
  ServiceGalleryMediaDto,
  ServiceGalleryMediaType,
  ServiceLayoutType,
} from "@/types/services"
import { parseFeaturedFields } from "@/lib/featured-fields"

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v|ogv|ogg)(\?|$)/i

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

function coerceStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
}

function coerceNumberArray(raw: unknown): number[] {
  if (!Array.isArray(raw)) return []
  const out: number[] = []
  for (const item of raw) {
    const n = coerceInt(item)
    if (typeof n === "number" && Number.isFinite(n)) out.push(n)
  }
  return out
}

function coerceLayoutType(raw: unknown): ServiceLayoutType | null {
  if (raw === "DEFAULT" || raw === "FEATURE_GRID" || raw === "MEDIA_HERO") {
    return raw
  }
  return null
}

function detectMediaType(url: string): ServiceGalleryMediaType {
  return VIDEO_EXTENSIONS.test(url) ? "VIDEO" : "IMAGE"
}

function coerceGalleryType(raw: unknown, url: string): ServiceGalleryMediaType {
  const s = coerceStr(raw)?.toUpperCase()
  if (s === "IMAGE" || s === "VIDEO") return s
  const kind = coerceStr(raw)?.toUpperCase()
  if (kind === "IMAGE" || kind === "VIDEO") return kind
  return detectMediaType(url)
}

function normalizeGalleryItem(raw: unknown): ServiceGalleryMediaDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const url = coerceStr(o.url)
  if (!url) return null
  return {
    type: coerceGalleryType(o.type ?? o.kind, url),
    url,
    posterUrl: coerceStr(o.posterUrl) ?? coerceStr(o.poster_url),
    alt: coerceStr(o.alt),
  }
}

function normalizeGalleryList(raw: unknown): ServiceGalleryMediaDto[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: ServiceGalleryMediaDto[] = []
  for (const item of raw) {
    const slot = normalizeGalleryItem(item)
    if (!slot || seen.has(slot.url)) continue
    seen.add(slot.url)
    out.push(slot)
  }
  return out
}

function synthesizeGalleryFromLegacy(d: ServiceDto): ServiceGalleryMediaDto[] {
  const seen = new Set<string>()
  const out: ServiceGalleryMediaDto[] = []

  function push(slot: ServiceGalleryMediaDto) {
    if (seen.has(slot.url)) return
    seen.add(slot.url)
    out.push(slot)
  }

  const heroVideo = coerceStr(d.heroVideoUrl)
  const heroPoster = coerceStr(d.heroPosterUrl)
  if (heroVideo) {
    push({
      type: "VIDEO",
      url: heroVideo,
      posterUrl: heroPoster,
    })
  } else if (heroPoster) {
    push({ type: "IMAGE", url: heroPoster })
  }

  for (const url of d.featureImageUrls ?? []) {
    const u = url.trim()
    if (u) push({ type: detectMediaType(u), url: u })
  }
  for (const url of d.thumbnailUrls ?? []) {
    const u = url.trim()
    if (u) push({ type: detectMediaType(u), url: u })
  }

  return out
}

function normalizeContentDto(raw: unknown): ServiceContentDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const lang = o.languageCode ?? o.language_code
  if (lang !== "CKB" && lang !== "KMR") return null
  const title = coerceStr(o.title)
  if (!title) return null
  return {
    id: coerceInt(o.id),
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

export function normalizeServiceDto(d: ServiceDto): ServiceDto {
  const raw = d as ServiceDto & Record<string, unknown>
  const contents =
    d.contents?.length > 0 ? normalizeContentsList(d.contents) : []
  const contentLanguages =
    d.contentLanguages?.filter(
      (l): l is "CKB" | "KMR" => l === "CKB" || l === "KMR",
    ) ?? contents.map((c) => c.languageCode)

  const heroVideoUrl =
    coerceStr(d.heroVideoUrl) ?? coerceStr(raw.hero_video_url)
  const heroPosterUrl =
    coerceStr(d.heroPosterUrl) ?? coerceStr(raw.hero_poster_url)
  const featureImageUrls = coerceStringArray(
    d.featureImageUrls ?? raw.feature_image_urls,
  )
  const thumbnailUrls = coerceStringArray(
    d.thumbnailUrls ?? raw.thumbnail_urls,
  )

  const galleryRaw = raw.galleryMedia ?? raw.gallery_media
  let galleryMedia = normalizeGalleryList(galleryRaw)
  if (galleryMedia.length === 0) {
    galleryMedia = synthesizeGalleryFromLegacy({
      ...d,
      heroVideoUrl,
      heroPosterUrl,
      featureImageUrls,
      thumbnailUrls,
    })
  }

  const sortOrderRaw = d.sortOrder ?? raw.sort_order
  const sortOrder =
    typeof sortOrderRaw === "number" && Number.isFinite(sortOrderRaw)
      ? sortOrderRaw
      : coerceInt(sortOrderRaw) ?? null

  return {
    ...d,
    ...parseFeaturedFields(raw),
    active: coerceBool(d.active, true),
    serviceType: coerceStr(d.serviceType) ?? coerceStr(raw.service_type),
    location: coerceStr(d.location),
    layoutType:
      coerceLayoutType(d.layoutType) ??
      coerceLayoutType(raw.layout_type),
    navAnchorId:
      coerceStr(d.navAnchorId) ?? coerceStr(raw.nav_anchor_id),
    sortOrder,
    galleryMedia,
    heroVideoUrl,
    heroPosterUrl,
    featureImageUrls,
    thumbnailUrls,
    partnerIds: coerceNumberArray(d.partnerIds ?? raw.partner_ids),
    contents,
    contentLanguages:
      contentLanguages.length > 0 ? contentLanguages : ["CKB"],
  }
}

export function galleryPreviewUrl(
  service: Pick<ServiceDto, "galleryMedia">,
): string | null {
  const slot = service.galleryMedia?.[0]
  if (!slot?.url) return null
  if (slot.type === "VIDEO") {
    return slot.posterUrl?.trim() || slot.url.trim()
  }
  return slot.url.trim()
}
