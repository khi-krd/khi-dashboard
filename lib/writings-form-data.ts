import type { WritingFormValues } from "@/lib/validations/writings"
import { normalizeGenreSlug, type BookGenreDto } from "@/types/book-genre"

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

/**
 * Maps the picked slugs onto the ids the backend is moving to.
 *
 * Returns `undefined` — meaning "do not send `genreIds` at all" — whenever the
 * mapping cannot be completed: the genre list was unreachable, or the book
 * carries a slug the loaded list does not contain (a genre hidden since the
 * book was written). A partial `genreIds` would read to the server as a
 * deliberate removal of the genres that were left out, so in those cases only
 * the slug array is sent and the server's own lookup does the work.
 */
function resolveGenreIds(
  slugs: string[],
  genres: BookGenreDto[] | undefined,
): number[] | undefined {
  if (!genres || genres.length === 0) return undefined
  const bySlug = new Map(
    genres.flatMap((g) => (g.id == null ? [] : [[g.slug, g.id] as const])),
  )
  const ids: number[] = []
  for (const slug of slugs) {
    const id = bySlug.get(normalizeGenreSlug(slug))
    if (id == null) return undefined
    ids.push(id)
  }
  return ids
}

export function writingFormValuesToMultipart(
  mode: "create" | "edit",
  writingId: number | undefined,
  values: WritingFormValues,
  /** The genres currently known to the dashboard, for the slug → id mapping. */
  genres?: BookGenreDto[],
): FormData {
  const fd = new FormData()

  const payload: Record<string, unknown> = {
    ...(mode === "edit" && typeof writingId === "number" ? { id: writingId } : {}),
    // The slug array is what the backend accepts today and still accepts during
    // the transition; `genreIds` below is what it is moving to. Both go while
    // the two coexist, so a save works against either build of the API.
    bookGenres: values.bookGenres,
    publishedByInstitute: values.publishedByInstitute,
    contentLanguages: values.contentLanguages,
    tags: { ckb: values.tags.ckb, kmr: values.tags.kmr },
    keywords: { ckb: values.keywords.ckb, kmr: values.keywords.kmr },
    ckbCoverUrl: trimOrUndef(values.ckbCoverUrl),
    kmrCoverUrl: trimOrUndef(values.kmrCoverUrl),
    hoverCoverUrl: trimOrUndef(values.hoverCoverUrl),
    ckbContent: values.contentLanguages.includes("CKB")
      ? buildContent("CKB", values, values.ckbBookFile)
      : undefined,
    kmrContent: values.contentLanguages.includes("KMR")
      ? buildContent("KMR", values, values.kmrBookFile)
      : undefined,
  }

  const genreIds = resolveGenreIds(values.bookGenres, genres)
  if (genreIds) {
    payload.genreIds = genreIds
  }

  if (values.seriesMode === "series") {
    // `seriesId` only exists on the create contract — `UpdateRequest` has no
    // such field, and the strict `data` parser fails the whole update with
    // `400 Unrecognized field "seriesId"` if it is sent. Reparenting on edit
    // happens through `parentBookId`, which copies the parent's series key.
    if (mode === "create" && values.seriesId?.trim()) {
      payload.seriesId = values.seriesId.trim()
    }
    payload.seriesName = trimOrUndef(values.seriesName)
    payload.seriesOrder = values.seriesOrder ?? 1
    payload.parentBookId = values.parentBookId ?? null
  }
  // On edit + standalone nothing is sent: update merges non-null fields, and
  // `parentBookId: null` cannot unlink a book anyway, so the nulls were noise.

  if (
    values.newTopic?.nameCkb?.trim() ||
    values.newTopic?.nameKmr?.trim()
  ) {
    payload.newTopic = {
      nameCkb: trimOrUndef(values.newTopic.nameCkb),
      nameKmr: trimOrUndef(values.newTopic.nameKmr),
    }
    payload.topicId = null
  } else if (values.clearTopic) {
    // `topicId: null` on update is read as "unchanged" — detaching a topic
    // needs the explicit flag, which also wins over any topicId in the blob.
    payload.clearTopic = true
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
