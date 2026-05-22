import type { ServiceDto } from "@/types/services"

import type { ServiceFormValues } from "@/lib/validations/services"

export function serviceFormValuesToPayload(
  mode: "create" | "edit",
  serviceId: number | undefined,
  values: ServiceFormValues,
): Omit<ServiceDto, "createdAt" | "updatedAt" | "createdBy" | "updatedBy"> & {
  id?: number
} {
  const contents = values.contentLanguages.map((lang) => {
    const row = values.contents.find((c) => c.languageCode === lang)!
    return {
      languageCode: lang,
      title: row.title.trim(),
      description: row.description ?? "",
    }
  })

  const mediaCollections = values.mediaCollections.map((col, ci) => ({
    ...(typeof col.id === "number" && col.id > 0 ? { id: col.id } : {}),
    collectionName: col.collectionName.trim(),
    mediaType: col.mediaType,
    sortOrder: ci,
    files: col.files
      .filter((f) => f.fileUrl?.trim() && !f.uploadPending)
      .map((f, fi) => ({
        ...(typeof f.id === "number" && f.id > 0 ? { id: f.id } : {}),
        fileUrl: f.fileUrl.trim(),
        thumbnailUrl: f.thumbnailUrl?.trim() || undefined,
        ckbContent: f.ckbContent,
        kmrContent: f.kmrContent,
        sortOrder: fi,
      })),
  }))

  const coverMediaUrl =
    values.coverMediaUrl?.trim() ||
    values.existingCoverMediaUrl?.trim() ||
    undefined

  return {
    ...(mode === "edit" && typeof serviceId === "number"
      ? { id: serviceId }
      : {}),
    serviceType: values.serviceType.trim(),
    location: values.location?.trim() || undefined,
    coverMediaUrl,
    active: values.active,
    publishedAt: values.publishedAt ?? null,
    contents,
    mediaCollections,
    contentLanguages: values.contentLanguages,
  }
}

