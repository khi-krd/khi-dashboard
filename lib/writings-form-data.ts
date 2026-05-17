import type { WritingFormValues } from "@/lib/validations/writings"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

function buildContent(
  lang: "CKB" | "KMR",
  values: WritingFormValues,
  stagedFile: File | null | undefined,
) {
  const content = lang === "CKB" ? values.ckbContent : values.kmrContent
  if (!content) return undefined
  const hasStaged = !!stagedFile
  return {
    title: content.title?.trim() ?? "",
    description: content.description ?? "",
    writer: trimOrUndef(content.writer),
    fileUrl: hasStaged ? null : trimOrUndef(content.fileUrl),
    fileFormat: content.fileFormat ?? undefined,
    fileSizeBytes: content.fileSizeBytes ?? 0,
    pageCount: content.pageCount ?? undefined,
    genre: trimOrUndef(content.genre),
  }
}

export function writingFormValuesToMultipart(
  mode: "create" | "edit",
  writingId: number | undefined,
  values: WritingFormValues,
): FormData {
  const fd = new FormData()

  const payload: Record<string, unknown> = {
    ...(mode === "edit" && typeof writingId === "number" ? { id: writingId } : {}),
    bookGenres: values.bookGenres,
    publishedByInstitute: values.publishedByInstitute,
    contentLanguages: values.contentLanguages,
    tags: { ckb: values.tags.ckb, kmr: values.tags.kmr },
    keywords: { ckb: values.keywords.ckb, kmr: values.keywords.kmr },
    ckbContent: values.contentLanguages.includes("CKB")
      ? buildContent("CKB", values, values.ckbBookFile)
      : undefined,
    kmrContent: values.contentLanguages.includes("KMR")
      ? buildContent("KMR", values, values.kmrBookFile)
      : undefined,
  }

  if (mode === "create") {
    payload.seriesId =
      values.seriesId?.trim() || `series-${Date.now()}`
  } else if (values.seriesId?.trim()) {
    payload.seriesId = values.seriesId.trim()
  }

  if (values.seriesMode === "series") {
    payload.seriesName = trimOrUndef(values.seriesName)
    payload.seriesOrder = values.seriesOrder ?? 1
    payload.seriesTotalBooks = values.seriesTotalBooks ?? undefined
    payload.parentBookId = values.parentBookId ?? null
  } else if (mode === "edit") {
    payload.parentBookId = null
    payload.seriesName = null
  }

  if (values.clearTopic) {
    payload.clearTopic = true
    payload.topicId = null
  } else if (
    values.newTopic?.nameCkb?.trim() ||
    values.newTopic?.nameKmr?.trim()
  ) {
    payload.newTopic = {
      nameCkb: values.newTopic.nameCkb.trim(),
      nameKmr: values.newTopic.nameKmr.trim(),
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
  if (values.ckbBookFile) fd.append("ckbBookFile", values.ckbBookFile)
  if (values.kmrBookFile) fd.append("kmrBookFile", values.kmrBookFile)

  return fd
}
