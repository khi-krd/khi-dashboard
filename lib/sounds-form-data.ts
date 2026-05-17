import type { SoundFormValues } from "@/lib/validations/sounds"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

export function soundFormValuesToMultipart(
  mode: "create" | "edit",
  soundId: number | undefined,
  values: SoundFormValues,
): FormData {
  const fd = new FormData()

  const filesPayload = values.files.map((f, i) => ({
    ...(typeof f.id === "number" && f.id > 0 ? { id: f.id } : {}),
    fileUrl: trimOrUndef(f.fileUrl),
    externalUrl: trimOrUndef(f.externalUrl),
    embedUrl: trimOrUndef(f.embedUrl),
    title: trimOrUndef(f.title),
    fileType: f.fileType ?? "AUDIO",
    publishmentYear: f.publishmentYear ?? undefined,
    fileFormat: trimOrUndef(f.fileFormat),
    sizeBytes: f.sizeBytes ?? 0,
    durationSeconds: f.durationSeconds ?? 0,
    bitRate: trimOrUndef(f.bitRate),
    sampleRate: trimOrUndef(f.sampleRate),
    audioChannel: f.audioChannel ?? undefined,
    form: trimOrUndef(f.form),
    genre: trimOrUndef(f.genre),
    recordingVenue: trimOrUndef(f.recordingVenue),
    brochures: f.brochures.map((b, bi) => ({
      ...(typeof b.id === "number" && b.id > 0 ? { id: b.id } : {}),
      imageUrl: trimOrUndef(b.imageUrl),
      caption: trimOrUndef(b.caption),
      brochureOrder: b.brochureOrder ?? bi,
    })),
    fileOrder: i,
  }))

  const attachmentsPayload = values.attachments.map((a, i) => ({
    ...(typeof a.id === "number" && a.id > 0 ? { id: a.id } : {}),
    fileUrl: trimOrUndef(a.fileUrl),
    title: trimOrUndef(a.title),
    attachmentType: a.attachmentType ?? "OTHER",
    sizeBytes: a.sizeBytes ?? 0,
    mimeType: trimOrUndef(a.mimeType),
    attachmentOrder: a.attachmentOrder ?? i,
  }))

  const payload: Record<string, unknown> = {
    ...(mode === "edit" && typeof soundId === "number" ? { id: soundId } : {}),
    trackState: values.trackState,
    albumOfMemories:
      values.trackState === "MULTI" ? values.albumOfMemories : false,
    soundType: values.soundType.trim(),
    contentLanguages: values.contentLanguages,
    reader: trimOrUndef(values.reader),
    directors: values.directors,
    locations: values.locations,
    terms: trimOrUndef(values.terms),
    thisProjectOfInstitute: values.thisProjectOfInstitute,
    tags: { ckb: values.tags.ckb, kmr: values.tags.kmr },
    keywords: { ckb: values.keywords.ckb, kmr: values.keywords.kmr },
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
    files: filesPayload,
    attachments: attachmentsPayload,
  }

  if (values.trackState === "MULTI") {
    payload.albumName = trimOrUndef(values.albumName)
    payload.publishmentYear = values.publishmentYear ?? undefined
    payload.cdNumber = values.cdNumber ?? undefined
    payload.totalTracks = values.totalTracks ?? undefined
  }

  if (values.clearTopic) {
    payload.clearTopic = true
    payload.topicId = null
  } else if (
    values.newTopic?.nameCkb?.trim() ||
    values.newTopic?.nameKmr?.trim()
  ) {
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
  if (values.hoverCoverFile) fd.append("hoverCoverImage", values.hoverCoverFile)

  for (const f of values.files) {
    if (f.stagedAudioFile) {
      fd.append("audioFiles", f.stagedAudioFile)
    }
  }

  for (const f of values.files) {
    for (const b of f.brochures) {
      if (b.stagedImageFile) {
        fd.append("brochureFiles", b.stagedImageFile)
      }
    }
  }

  for (const a of values.attachments) {
    if (a.stagedAttachmentFile) {
      fd.append("attachmentFiles", a.stagedAttachmentFile)
    }
  }

  return fd
}
