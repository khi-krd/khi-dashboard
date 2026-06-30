import type { NewsDto } from "@/types/news"
import { galleryFormValuesToDto } from "@/types/media-gallery"

import type { NewsFormValues } from "@/lib/validations/news"

export type NewsWritePayload = Omit<
  NewsDto,
  "id" | "createdAt" | "updatedAt" | "media"
>

function toIsoMiddayUtc(dateYYYYMMDD: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYYYYMMDD)) return dateYYYYMMDD
  return `${dateYYYYMMDD}T12:00:00.000Z`
}

export function newsFormValuesToPayload(values: NewsFormValues): NewsWritePayload {
  const coverUrl =
    values.coverUrl?.trim() ||
    values.existingCoverUrl?.trim() ||
    undefined

  const coverThumbnailUrl =
    values.coverThumbnailUrl?.trim() ||
    values.existingCoverThumbnailUrl?.trim() ||
    undefined

  return {
    contentLanguages: values.contentLanguages,
    category: values.category,
    subCategory: values.subCategory,
    coverUrl,
    coverMediaType: values.coverMediaType,
    coverThumbnailUrl,
    mediaGallery: galleryFormValuesToDto(values.mediaGallery),
    datePublished: values.datePublished
      ? toIsoMiddayUtc(values.datePublished)
      : undefined,
    tags: values.tags,
    keywords: values.keywords,
    ckbContent: values.contentLanguages.includes("CKB")
      ? {
          title: values.ckbContent?.title?.trim() ?? "",
          description: values.ckbContent?.description ?? "",
        }
      : undefined,
    kmrContent: values.contentLanguages.includes("KMR")
      ? {
          title: values.kmrContent?.title?.trim() ?? "",
          description: values.kmrContent?.description ?? "",
        }
      : undefined,
  }
}
