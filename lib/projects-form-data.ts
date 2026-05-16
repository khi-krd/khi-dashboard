import type { ProjectDto } from "@/types/projects"

import type { ProjectFormValues } from "@/lib/validations/projects"

function toIsoMiddayUtc(dateYYYYMMDD: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYYYYMMDD)) return dateYYYYMMDD
  return `${dateYYYYMMDD}T12:00:00.000Z`
}

export function projectFormValuesToMultipart(
  mode: "create" | "edit",
  projectId: number | undefined,
  values: ProjectFormValues,
  options?: { dataField?: string },
): FormData {
  const dataField = options?.dataField ?? "data"
  const fd = new FormData()

  const media = values.mediaItems.map((m, i) => ({
    ...(typeof m.id === "number" && m.id > 0 ? { id: m.id } : {}),
    mediaType: m.mediaType,
    url: m.url?.trim() || undefined,
    externalUrl: m.externalUrl?.trim() || undefined,
    embedUrl: m.embedUrl?.trim() || undefined,
    caption: m.caption?.trim() || undefined,
    sortOrder: i,
  }))

  const payload: Omit<
    ProjectDto,
    "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
  > & { id?: number } = {
    ...(mode === "edit" && typeof projectId === "number"
      ? { id: projectId }
      : {}),
    status: values.status,
    projectTypeCkb: values.projectTypeCkb?.trim() || undefined,
    projectTypeKmr: values.projectTypeKmr?.trim() || undefined,
    contentLanguages: values.contentLanguages,
    coverUrl:
      values.coverUrl?.trim() ||
      values.existingCoverUrl?.trim() ||
      undefined,
    projectDate: values.projectDate
      ? toIsoMiddayUtc(values.projectDate)
      : undefined,
    contentsCkb: values.contents.ckb,
    contentsKmr: values.contents.kmr,
    tagsCkb: values.tags.ckb,
    tagsKmr: values.tags.kmr,
    keywordsCkb: values.keywords.ckb,
    keywordsKmr: values.keywords.kmr,
    media,
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
