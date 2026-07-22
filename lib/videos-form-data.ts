import type { VideoDto } from "@/types/videos"

import type { VideoFormValues } from "@/lib/validations/videos"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

function clipHasSource(c: VideoFormValues["videoClipItems"][number]) {
  return !!(
    c.url?.trim() ||
    c.externalUrl?.trim() ||
    c.embedUrl?.trim() ||
    c.stagedVideoFile
  )
}

function sourceHasContent(s: VideoFormValues["videoSources"][number]) {
  return !!(
    s.url?.trim() ||
    s.externalUrl?.trim() ||
    s.embedUrl?.trim() ||
    s.stagedVideoFile
  )
}

export function videoFormValuesToMultipart(
  mode: "create" | "edit",
  videoId: number | undefined,
  values: VideoFormValues,
): FormData {
  const fd = new FormData()

  const clips =
    values.videoType === "VIDEO_CLIP"
      ? values.videoClipItems
          .filter(clipHasSource)
          .map((c, i) => ({
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
    ckbCoverUrl: trimOrUndef(values.ckbCoverUrl),
    kmrCoverUrl: trimOrUndef(values.kmrCoverUrl),
    hoverCoverUrl: trimOrUndef(values.hoverCoverUrl),
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
    const shouldSendSources = mode === "create" || values.sourcesTouched

    if (shouldSendSources) {
      const sources = values.videoSources.filter(sourceHasContent)
      const hasMain = sources.some((s) => s.main)
      payload.videoSources = sources.map((s, i) => ({
        url: trimOrUndef(s.url),
        externalUrl: trimOrUndef(s.externalUrl),
        embedUrl: trimOrUndef(s.embedUrl),
        main: hasMain ? !!s.main : i === 0,
        label: trimOrUndef(s.label),
        durationSeconds: s.durationSeconds ?? undefined,
      }))

      const mainIdx = payload.videoSources.findIndex((s) => s.main)
      const mainFormSource =
        mainIdx >= 0 ? sources[mainIdx] : sources[0]

      payload.fileFormat = trimOrUndef(
        mainFormSource?.fileFormat ?? values.fileFormat,
      )
      payload.durationSeconds =
        mainFormSource?.durationSeconds ??
        values.durationSeconds ??
        undefined
      payload.resolution = trimOrUndef(
        mainFormSource?.resolution ?? values.resolution,
      )
      payload.fileSizeMb =
        mainFormSource?.fileSizeMb ?? values.fileSizeMb ?? undefined
    } else {
      payload.fileFormat = trimOrUndef(values.fileFormat)
      payload.durationSeconds = values.durationSeconds ?? undefined
      payload.resolution = trimOrUndef(values.resolution)
      payload.fileSizeMb = values.fileSizeMb ?? undefined
    }
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

  if (values.videoType === "FILM") {
    const shouldSendSources = mode === "create" || values.sourcesTouched
    if (shouldSendSources) {
      for (const source of values.videoSources) {
        if (source.stagedVideoFile) {
          fd.append("videoFiles", source.stagedVideoFile)
        }
      }
    }
  }

  if (values.videoType === "VIDEO_CLIP") {
    for (const clip of values.videoClipItems) {
      if (clip.stagedVideoFile && clipHasSource(clip)) {
        fd.append("clipFiles", clip.stagedVideoFile)
      }
    }
  }

  return fd
}
