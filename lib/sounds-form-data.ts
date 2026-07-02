import type { SoundFormValues } from "@/lib/validations/sounds"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

function fileHasSource(
  f: SoundFormValues["files"][number],
): boolean {
  return !!(
    f.fileUrl?.trim() ||
    f.externalUrl?.trim() ||
    f.embedUrl?.trim() ||
    f.stagedAudioFile
  )
}

function attachmentHasSource(
  a: SoundFormValues["attachments"][number],
): boolean {
  return !!(a.fileUrl?.trim() || a.stagedAttachmentFile)
}

export function soundFormValuesToMultipart(
  mode: "create" | "edit",
  soundId: number | undefined,
  values: SoundFormValues,
): FormData {
  const fd = new FormData()

  const readyFiles = values.files.filter(fileHasSource)

  const filesPayload = readyFiles.map((f, i) => ({
    ...(typeof f.id === "number" && f.id > 0 ? { id: f.id } : {}),
    fileUrl: trimOrUndef(f.fileUrl),
    externalUrl: trimOrUndef(f.externalUrl),
    embedUrl: trimOrUndef(f.embedUrl),
    title: trimOrUndef(f.title),
    fileType: f.fileType ?? "AUDIO",
    publishmentYear: f.publishmentYear ?? undefined,
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
    sortOrder: i,
  }))

  const readyAttachments =
    values.trackState === "MULTI"
      ? values.attachments.filter(attachmentHasSource)
      : []

  const attachmentsPayload = readyAttachments.map((a, i) => ({
    ...(typeof a.id === "number" && a.id > 0 ? { id: a.id } : {}),
    fileUrl: trimOrUndef(a.fileUrl),
    title: trimOrUndef(a.title),
    attachmentType: a.attachmentType ?? "OTHER",
    attachmentOrder: a.attachmentOrder ?? i,
  }))

  const payload: Record<string, unknown> = {
    ...(mode === "edit" && typeof soundId === "number" ? { id: soundId } : {}),
    trackState: values.trackState,
    soundType: values.soundType.trim(),
    contentLanguages: values.contentLanguages,
    ckbCoverUrl: trimOrUndef(values.ckbCoverUrl),
    kmrCoverUrl: trimOrUndef(values.kmrCoverUrl),
    hoverCoverUrl: trimOrUndef(values.hoverCoverUrl),
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

  for (const f of readyFiles) {
    if (f.stagedAudioFile) {
      fd.append("audioFiles", f.stagedAudioFile)
    }
  }

  for (const f of readyFiles) {
    for (const b of f.brochures) {
      if (b.stagedImageFile) {
        fd.append("brochureFiles", b.stagedImageFile)
      }
    }
  }

  for (const a of readyAttachments) {
    if (a.stagedAttachmentFile) {
      fd.append("attachmentFiles", a.stagedAttachmentFile)
    }
  }

  return fd
}
