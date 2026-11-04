import type { WritingFormValues } from "@/lib/validations/writings"
import { normalizeGenreSlug, type BookGenreDto } from "@/types/book-genre"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

function buildContent(lang: "CKB" | "KMR", values: WritingFormValues) {
  const content = lang === "CKB" ? values.ckbContent : values.kmrContent
  if (!content) return undefined
  return {
    title: content.title?.trim() ?? "",
    description: content.description ?? "",

    // A staged book file wins server-side; the typed URL still goes along.
    fileUrl: trimOrUndef(content.fileUrl),
    fileFormat: content.fileFormat ?? undefined,
    fileSizeBytes: content.fileSizeBytes ?? 0,
    pageCount: content.pageCount ?? undefined,
    location: trimOrUndef(content.location),
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
  /** Edit-mode context: was the saved record a series child? */
  context?: { wasChild?: boolean },
): FormData {
  const fd = new FormData()

  const payload: Record<string, unknown> = {
    ...(mode === "edit" && typeof writingId === "number" ? { id: writingId } : {}),
    // The slug array is what the backend accepts today and still accepts during
    // the transition; `genreIds` below is what it is moving to. Both go while
    // the two coexist, so a save works against either build of the API.
    bookGenres: values.bookGenres,
    publishedByInstitute: values.publishedByInstitute,
    bookLanguageCkb: values.bookLanguageCkb?.trim() ?? "",
    bookLanguageKmr: values.bookLanguageKmr?.trim() ?? "",
    contentLanguages: values.contentLanguages,
    tags: { ckb: values.tags.ckb, kmr: values.tags.kmr },
    keywords: { ckb: values.keywords.ckb, kmr: values.keywords.kmr },
    ckbCoverUrl: trimOrUndef(values.ckbCoverUrl),
    kmrCoverUrl: trimOrUndef(values.kmrCoverUrl),
    hoverCoverUrl: trimOrUndef(values.hoverCoverUrl),
    // People are a replace-set — always sent, so an empty list clears them.
    persons: values.persons
      .map((p) => ({
        roleCkb: trimOrUndef(p.roleCkb),
        roleKmr: trimOrUndef(p.roleKmr),
        nameCkb: trimOrUndef(p.nameCkb),
        nameKmr: trimOrUndef(p.nameKmr),
        nicknameCkb: trimOrUndef(p.nicknameCkb),
        nicknameKmr: trimOrUndef(p.nicknameKmr),
      }))
      .filter((p) => p.nameCkb || p.nameKmr),
    ckbContent: values.contentLanguages.includes("CKB")
      ? buildContent("CKB", values)
      : undefined,
    kmrContent: values.contentLanguages.includes("KMR")
      ? buildContent("KMR", values)
      : undefined,
  }

  const genreIds = resolveGenreIds(values.bookGenres, genres)
  if (genreIds) {
    payload.genreIds = genreIds
  }

  // Series — the backend owns the root model: it derives the name from the
  // primary book's title, assigns the next volume number, and recomputes the
  // totals. The form only declares INTENT:
  //   standalone → detach (edit only; a create is standalone by default)
  //   primary    → startSeries + the declared total for the whole chain
  //   child      → parentBookId of the primary (always the chain's ROOT book)
  if (values.seriesMode === "primary") {
    if (mode === "edit" && context?.wasChild) {
      payload.unlinkFromSeries = true
    }
    payload.startSeries = true
    if (values.seriesTotalBooks != null) {
      payload.seriesTotalBooks = values.seriesTotalBooks
    }
  } else if (values.seriesMode === "child") {
    if (values.parentBookId != null) {
      payload.parentBookId = values.parentBookId
    }
  } else if (mode === "edit") {
    // Standalone on edit = explicit unlink (`parentBookId: null` cannot detach,
    // so the dedicated flag does it — a series root hands the chain to its
    // next book).
    payload.unlinkFromSeries = true
  }

  // Topics are a replace-set — always sent, so an empty selection clears.
  payload.topicIds = values.topicIds
  const namedNewTopics = values.newTopics
    .map((t) => ({
      nameCkb: trimOrUndef(t.nameCkb),
      nameKmr: trimOrUndef(t.nameKmr),
    }))
    .filter((t) => t.nameCkb || t.nameKmr)
  if (namedNewTopics.length > 0) {
    payload.newTopics = namedNewTopics
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
