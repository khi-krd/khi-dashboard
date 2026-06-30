import type { MediaGalleryItemDto, MediaKind, NewsDto } from "@/types/news"
import { galleryDtoToFormValues } from "@/types/media-gallery"

function coerceStr(v: unknown): string | null {
  if (v == null) return null
  if (typeof v === "string") return v
  return String(v)
}

function coerceKind(v: unknown): MediaKind | null {
  const s = coerceStr(v)?.toUpperCase()
  if (s === "IMAGE" || s === "VIDEO" || s === "AUDIO") return s
  return null
}

function normalizeGalleryItem(raw: unknown): MediaGalleryItemDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const url = coerceStr(o.url)
  if (!url?.trim()) return null
  return {
    url: url.trim(),
    kind: coerceKind(o.kind) ?? "IMAGE",
    thumbnailUrl: coerceStr(o.thumbnailUrl) ?? coerceStr(o.thumbnail_url),
    captionCkb: coerceStr(o.captionCkb) ?? coerceStr(o.caption_ckb),
    captionKmr: coerceStr(o.captionKmr) ?? coerceStr(o.caption_kmr),
    sortOrder:
      typeof o.sortOrder === "number"
        ? o.sortOrder
        : typeof o.sort_order === "number"
          ? o.sort_order
          : undefined,
  }
}

export function normalizeNewsDto(d: NewsDto): NewsDto {
  const raw = d as NewsDto & Record<string, unknown>
  const galleryRaw = raw.mediaGallery ?? raw.media_gallery
  const mediaGallery = Array.isArray(galleryRaw)
    ? galleryRaw.map(normalizeGalleryItem).filter((x): x is MediaGalleryItemDto => x != null)
    : d.mediaGallery

  return {
    ...d,
    coverMediaType:
      coerceKind(d.coverMediaType) ??
      coerceKind(raw.cover_media_type) ??
      "IMAGE",
    coverThumbnailUrl:
      d.coverThumbnailUrl ??
      coerceStr(raw.coverThumbnailUrl) ??
      coerceStr(raw.cover_thumbnail_url),
    mediaGallery,
  }
}

export { galleryDtoToFormValues }
