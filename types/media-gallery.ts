export type MediaKind = "IMAGE" | "VIDEO" | "AUDIO"

export type MediaGalleryItemDto = {
  url: string
  kind?: MediaKind
  thumbnailUrl?: string | null
  captionCkb?: string | null
  captionKmr?: string | null
  sortOrder?: number
}

export type MediaGalleryItemFormValues = {
  clientKey: string
  url: string
  kind: MediaKind
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
    thumbnailUrl: item.thumbnailUrl ?? "",
    captionCkb: item.captionCkb ?? "",
    captionKmr: item.captionKmr ?? "",
    sortOrder: item.sortOrder ?? index,
  }))
}

export function galleryFormValuesToDto(
  items: MediaGalleryItemFormValues[],
): MediaGalleryItemDto[] {
  return items
    .filter((item) => item.url.trim())
    .map((item, index) => ({
      url: item.url.trim(),
      kind: item.kind,
      thumbnailUrl: item.thumbnailUrl.trim() || undefined,
      captionCkb: item.captionCkb.trim() || undefined,
      captionKmr: item.captionKmr.trim() || undefined,
      sortOrder: item.sortOrder ?? index,
    }))
}
