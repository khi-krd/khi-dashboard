import type { ProjectDto } from "@/types/projects"
import { galleryFormValuesToDto } from "@/types/media-gallery"

import type { ProjectFormValues } from "@/lib/validations/projects"

export type ProjectWritePayload = Omit<
  ProjectDto,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "media"
>

function toIsoMiddayUtc(dateYYYYMMDD: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYYYYMMDD)) return dateYYYYMMDD
  return `${dateYYYYMMDD}T12:00:00.000Z`
}

export function projectFormValuesToPayload(
  values: ProjectFormValues,
): ProjectWritePayload {
  const coverUrl =
    values.coverUrl?.trim() ||
    values.existingCoverUrl?.trim() ||
    undefined

  const coverThumbnailUrl =
    values.coverThumbnailUrl?.trim() ||
    values.existingCoverThumbnailUrl?.trim() ||
    undefined

  return {
    status: values.status,
    projectTypeCkb:
      values.projectTypes[0]?.nameCkb?.trim() ||
      values.projectTypeCkb?.trim() ||
      undefined,
    projectTypeKmr:
      values.projectTypes[0]?.nameKmr?.trim() ||
      values.projectTypeKmr?.trim() ||
      undefined,
    projectTypes: values.projectTypes
      .map((t) => ({
        nameCkb: t.nameCkb.trim(),
        nameKmr: t.nameKmr.trim() || t.nameCkb.trim(),
      }))
      .filter((t) => t.nameCkb),
    contentLanguages: values.contentLanguages,
    coverUrl,
    coverMediaType: values.coverMediaType,
    coverThumbnailUrl,
    mediaGallery: galleryFormValuesToDto(values.mediaGallery),
    projectDate: values.projectDate
      ? toIsoMiddayUtc(values.projectDate)
      : undefined,
    tagsCkb: values.tags.ckb,
    tagsKmr: values.tags.kmr,
    keywordsCkb: values.keywords.ckb,
    keywordsKmr: values.keywords.kmr,
    ckbContent: values.contentLanguages.includes("CKB")
      ? {
          title: values.ckbContent?.title?.trim() ?? "",
          description: values.ckbContent?.description ?? "",
          location: values.ckbContent?.location?.trim() || undefined,
        }
      : undefined,
    kmrContent: values.contentLanguages.includes("KMR")
      ? {
          title: values.kmrContent?.title?.trim() ?? "",
          description: values.kmrContent?.description ?? "",
          location: values.kmrContent?.location?.trim() || undefined,
        }
      : undefined,
  }
}
