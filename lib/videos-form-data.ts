import type { VideoDto } from "@/types/videos"

import type { VideoFormValues } from "@/lib/validations/videos"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

export function videoFormValuesToMultipart(
  mode: "create" | "edit",
  videoId: number | undefined,
  values: VideoFormValues,
): FormData {
  const fd = new FormData()

  const clips =
    values.videoType === "VIDEO_CLIP"
      ? values.videoClipItems.map((c, i) => ({
          ...(typeof c.id === "number" && c.id > 0 ? { id: c.id } : {}),
          url: trimOrUndef(c.url),
          externalUrl: trimOrUndef(c.externalUrl),
          embedUrl: trimOrUndef(c.embedUrl),
          clipNumber: c.clipNumber ?? i + 1,
          durationSeconds: c.durationSeconds ?? undefined,
          resolution: trimOrUndef(c.resolution),
          fileFormat: trimOrUndef(c.fileFormat),
          fileSizeMb: c.fileSizeMb ?? undefined,
          titleCkb: trimOrUndef(c.titleCkb),
          titleKmr: trimOrUndef(c.titleKmr),
          descriptionCkb: c.descriptionCkb?.trim() || undefined,
          descriptionKmr: c.descriptionKmr?.trim() || undefined,
        }))
      : []

  const payload: Partial<VideoDto> & {
    id?: number
    newTopic?: { nameCkb?: string; nameKmr?: string }
    clearTopic?: boolean
  } = {
    ...(mode === "edit" && typeof videoId === "number" ? { id: videoId } : {}),
    videoType: values.videoType,
    albumOfMemories:
      values.videoType === "VIDEO_CLIP" ? values.albumOfMemories : false,
    contentLanguages: values.contentLanguages,
    publishmentDate: values.publishmentDate?.trim() || null,
    tagsCkb: values.tags.ckb,
    tagsKmr: values.tags.kmr,
    keywordsCkb: values.keywords.ckb,
    keywordsKmr: values.keywords.kmr,
    ckbContent: values.contentLanguages.includes("CKB")
      ? {
          title: values.ckbContent?.title?.trim() ?? "",
          description: values.ckbContent?.description ?? "",
          location: trimOrUndef(values.ckbContent?.location),
          director: trimOrUndef(values.ckbContent?.director),
          producer: trimOrUndef(values.ckbContent?.producer),
        }
      : undefined,
    kmrContent: values.contentLanguages.includes("KMR")
      ? {
          title: values.kmrContent?.title?.trim() ?? "",
          description: values.kmrContent?.description ?? "",
          location: trimOrUndef(values.kmrContent?.location),
          director: trimOrUndef(values.kmrContent?.director),
          producer: trimOrUndef(values.kmrContent?.producer),
        }
      : undefined,
    videoClipItems: clips,
  }

  if (values.videoType === "FILM") {
    payload.sourceUrl = trimOrUndef(values.sourceUrl)
    payload.sourceExternalUrl = trimOrUndef(values.sourceExternalUrl)
    payload.sourceEmbedUrl = trimOrUndef(values.sourceEmbedUrl)
    payload.fileFormat = trimOrUndef(values.fileFormat)
    payload.durationSeconds = values.durationSeconds ?? undefined
    payload.resolution = trimOrUndef(values.resolution)
    payload.fileSizeMb = values.fileSizeMb ?? undefined
  }

  if (values.clearTopic) {
    payload.clearTopic = true
    payload.topicId = null
  } else if (values.newTopic?.nameCkb?.trim() || values.newTopic?.nameKmr?.trim()) {
    payload.newTopic = {
      nameCkb: trimOrUndef(values.newTopic.nameCkb),
      nameKmr: trimOrUndef(values.newTopic.nameKmr),
    }
    payload.topicId = null
  } else if (values.topicId != null) {
    payload.topicId = values.topicId
  } else if (mode === "create") {
    payload.topicId = null
  }

  fd.append(
    "data",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  )

  if (values.ckbCoverFile) fd.append("ckbCoverImage", values.ckbCoverFile)
  if (values.kmrCoverFile) fd.append("kmrCoverImage", values.kmrCoverFile)
  if (values.hoverCoverFile) fd.append("hoverImage", values.hoverCoverFile)
  if (values.stagedVideoFile && values.videoType === "FILM") {
    fd.append("videoFile", values.stagedVideoFile)
  }

  return fd
}
