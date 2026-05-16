import type { NewsDto } from "@/types/news"

import type { NewsFormValues } from "@/lib/validations/news"

/**
 * Builds multipart body for `/with-files`.
 * Tune `multipartFieldData` (`data` vs `dto`) if the backend expects another part name.
 */
export function newsFormValuesToMultipart(
  mode: "create" | "edit",
  newsId: number | undefined,
  values: NewsFormValues,
  options?: { dataField?: string },
): FormData {
  const dataField = options?.dataField ?? "data"
  const fd = new FormData()

  const media = values.mediaItems.map((m, i) => ({
    ...(typeof m.id === "number" && m.id > 0 ? { id: m.id } : {}),
    type: m.type,
    url: m.url?.trim() || undefined,
    externalUrl: m.externalUrl?.trim() || undefined,
    embedUrl: m.embedUrl?.trim() || undefined,
    sortOrder: i,
  }))

  const payload: Omit<NewsDto, "createdAt" | "updatedAt"> & { id?: number } = {
    ...(mode === "edit" && typeof newsId === "number"
      ? { id: newsId }
      : {}),
    contentLanguages: values.contentLanguages,
    category: values.category,
    subCategory: values.subCategory,
    coverUrl:
      values.coverUrl?.trim() ||
      values.existingCoverUrl?.trim() ||
      undefined,
    datePublished: values.datePublished
      ? toIsoMiddayUtc(values.datePublished)
      : undefined,
    tags: values.tags,
    keywords: values.keywords,
    media,
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

  const jsonBlob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  })
  fd.append(dataField, jsonBlob)

  if (values.coverFile) fd.append("cover", values.coverFile)

  values.mediaItems.forEach((item) => {
    if (item.stagedFile) fd.append("media", item.stagedFile)
  })

  return fd
}

/** Best-effort: send a parseable ISO for date-only picker values. */
function toIsoMiddayUtc(dateYYYYMMDD: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYYYYMMDD)) return dateYYYYMMDD
  return `${dateYYYYMMDD}T12:00:00.000Z`
}
