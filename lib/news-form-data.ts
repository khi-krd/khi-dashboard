import type { NewsDto } from "@/types/news"
import { galleryFormValuesToDto } from "@/types/media-gallery"

import { isRichTextEmpty } from "@/lib/rich-text-empty"
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
      ? contentOrUndefined(values.ckbContent)
      : undefined,
    kmrContent: values.contentLanguages.includes("KMR")
      ? contentOrUndefined(values.kmrContent)
      : undefined,
  }
}

/**
 * Every field is optional to fill: a language block the editor never touched
 * is omitted from the payload entirely rather than sent as empty strings.
 */
function contentOrUndefined(
  content?: { title?: string | null; description?: string | null } | null,
): { title: string; description: string } | undefined {
  const title = content?.title?.trim() ?? ""
  const description = content?.description ?? ""
  const emptyDescription = isRichTextEmpty(description)
  if (!title && emptyDescription) return undefined
  return { title, description: emptyDescription ? "" : description }
}
