import { formatBytes } from "@/lib/sound-format"
import type { ImageAlbumItemDto } from "@/types/image-collections"

type AlbumSrcFields = {
  imageUrl?: string | null
  externalUrl?: string | null
  embedUrl?: string | null
}

export function albumItemSrc(item: AlbumSrcFields): string {
  return item.imageUrl?.trim() || item.externalUrl?.trim() || item.embedUrl?.trim() || ""
}

export function sortAlbumItems(items: ImageAlbumItemDto[]): ImageAlbumItemDto[] {
  return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export async function probeImageFile(file: File): Promise<{
  widthPx: number
  heightPx: number
  aspectRatio: number
  mimeType: string
  fileSizeBytes: number
  humanReadableSize: string
}> {
  const url = URL.createObjectURL(file)
  try {
    const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
      img.onerror = () => reject(new Error("image load failed"))
      img.src = url
    })
    const aspectRatio = dims.h > 0 ? dims.w / dims.h : 1
    return {
      widthPx: dims.w,
      heightPx: dims.h,
      aspectRatio,
      mimeType: file.type || "image/jpeg",
      fileSizeBytes: file.size,
      humanReadableSize: formatBytes(file.size),
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function applyImageFileMeta(
  file: File,
): Promise<{
  widthPx: number
  heightPx: number
  aspectRatio: number
  mimeType: string
  fileSizeBytes: number
  humanReadableSize: string
}> {
  return probeImageFile(file)
}
