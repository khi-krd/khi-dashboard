import { extractIframeSrc, toAudioEmbedUrl } from "@/lib/embed-url"
import { watchToEmbedUrl } from "@/lib/video-url-helpers"

export type MediaKind = "IMAGE" | "VIDEO" | "AUDIO"

export type MediaGalleryItemDto = {
  url: string
  kind?: MediaKind
  /** External page link (SoundCloud track page, YouTube watch URL, …). */
  externalUrl?: string | null
  /** Provider/player iframe URL the public site can embed directly. */
  embedUrl?: string | null
  thumbnailUrl?: string | null
  captionCkb?: string | null
  captionKmr?: string | null
  sortOrder?: number
}

export type MediaGalleryItemFormValues = {
  clientKey: string
  url: string
  kind: MediaKind
  externalUrl: string
  embedUrl: string
  thumbnailUrl: string
  captionCkb: string
  captionKmr: string
  sortOrder: number
}

export function createEmptyGalleryItem(sortOrder = 0): MediaGalleryItemFormValues {
  return {
    clientKey: crypto.randomUUID(),
    url: "",
    kind: "IMAGE",
    externalUrl: "",
    embedUrl: "",
    thumbnailUrl: "",
    captionCkb: "",
    captionKmr: "",
    sortOrder,
  }
}

export function galleryDtoToFormValues(
  items: MediaGalleryItemDto[] | undefined | null,
): MediaGalleryItemFormValues[] {
  return (items ?? []).map((item, index) => ({
    clientKey: crypto.randomUUID(),
    url: item.url ?? "",
    kind: item.kind ?? "IMAGE",
    externalUrl: item.externalUrl ?? "",
    embedUrl: item.embedUrl ?? "",
    thumbnailUrl: item.thumbnailUrl ?? "",
    captionCkb: item.captionCkb ?? "",
    captionKmr: item.captionKmr ?? "",
    sortOrder: item.sortOrder ?? index,
  }))
}

/**
 * Normalize what a user pasted into the embed field: raw <iframe> markup →
 * its src; known provider page URLs (YouTube/Vimeo/SoundCloud/Spotify/…) →
 * the provider's embed URL; anything else passes through untouched so the
 * website can still try to iframe it.
 */
function normalizeEmbedInput(raw: string, kind: MediaKind): string {
  const src = extractIframeSrc(raw)
  if (!src) return ""
  if (kind === "VIDEO") {
    return watchToEmbedUrl(src) ?? src
  }
  return toAudioEmbedUrl(src) ?? src
}

export function galleryFormValuesToDto(
  items: MediaGalleryItemFormValues[],
): MediaGalleryItemDto[] {
  return items
    .filter(
      (item) =>
        item.url.trim() || item.externalUrl.trim() || item.embedUrl.trim(),
    )
    .map((item, index) => ({
      url: extractIframeSrc(item.url),
      kind: item.kind,
      externalUrl: item.externalUrl.trim() || undefined,
      embedUrl: normalizeEmbedInput(item.embedUrl, item.kind) || undefined,
      thumbnailUrl: item.thumbnailUrl.trim() || undefined,
      captionCkb: item.captionCkb.trim() || undefined,
      captionKmr: item.captionKmr.trim() || undefined,
      sortOrder: item.sortOrder ?? index,
    }))
}
