import type { BookGenre, Language, WritingDto } from "@/types/writings"

export type WritingsUiLanguageFilter =
  | "all"
  | "ckb_only"
  | "kmr_only"
  | "both"

export type WritingsUiInstituteFilter =
  | "all"
  | "institute_only"
  | "external_only"

export type WritingsSearchMode = "writer" | "tag" | "keyword"

export type WritingsListQueryKeyParts = {
  page: number
  size: number
  keyword: string
  searchMode: WritingsSearchMode
  topicId: number | null
  languageFilter: WritingsUiLanguageFilter
}

export type WritingAdminTableRow = WritingDto & {
  titleCkb: string
  titleKmr: string
  writerCkb: string
  writerKmr: string
  sortTitleCkb: string
  sortWriterCkb: string
  sortCreated: number
  sortPages: number
}

export function toWritingAdminRow(w: WritingDto): WritingAdminTableRow {
  const titleCkb = w.ckbContent?.title ?? ""
  const titleKmr = w.kmrContent?.title ?? ""
  const writerCkb = w.ckbContent?.writer ?? ""
  const writerKmr = w.kmrContent?.writer ?? ""
  const created = w.createdAt ? new Date(w.createdAt).getTime() : 0
  return {
    ...w,
    titleCkb,
    titleKmr,
    writerCkb,
    writerKmr,
    sortTitleCkb: titleCkb.trim().toLowerCase(),
    sortWriterCkb: writerCkb.trim().toLowerCase(),
    sortCreated: Number.isFinite(created) ? created : 0,
    sortPages: primaryPageCount(w),
  }
}

export function getWritingCoverUrl(w: WritingDto): string | null {
  return (
    w.ckbCoverUrl?.trim() ||
    w.kmrCoverUrl?.trim() ||
    w.hoverCoverUrl?.trim() ||
    null
  )
}

export function primaryPageCount(w: WritingDto): number {
  const ckb = w.ckbContent?.pageCount
  if (ckb != null && ckb > 0) return ckb
  const kmr = w.kmrContent?.pageCount
  if (kmr != null && kmr > 0) return kmr
  return 0
}

export function primaryFileFormat(w: WritingDto): string | null {
  return (
    w.ckbContent?.fileFormat?.trim() ||
    w.kmrContent?.fileFormat?.trim() ||
    null
  )
}

export function isPartOfMultiBookSeries(w: WritingDto): boolean {
  const total =
    w.seriesInfo?.totalBooks ?? w.seriesTotalBooks ?? 1
  return total > 1 || !!w.seriesInfo?.isPartOfSeries
}

export function deriveDistinctWriters(rows: WritingDto[]): string[] {
  const set = new Set<string>()
  for (const w of rows) {
    const ckb = w.ckbContent?.writer?.trim()
    const kmr = w.kmrContent?.writer?.trim()
    if (ckb) set.add(ckb)
    if (kmr && kmr !== ckb) set.add(kmr)
  }
  return [...set].sort((a, b) => a.localeCompare(b, "ckb"))
}

export function matchesWritingLanguageFilter(
  w: WritingDto,
  filter: WritingsUiLanguageFilter,
): boolean {
  const langs = normalizeLanguages(w.contentLanguages)
  const hasCkb = langs.includes("CKB")
  const hasKmr = langs.includes("KMR")
  if (filter === "all") return true
  if (filter === "ckb_only") return hasCkb && !hasKmr
  if (filter === "kmr_only") return hasKmr && !hasCkb
  if (filter === "both") return hasCkb && hasKmr
  return true
}

export function matchesWritingInstituteFilter(
  w: WritingDto,
  filter: WritingsUiInstituteFilter,
): boolean {
  if (filter === "all") return true
  if (filter === "institute_only") return !!w.publishedByInstitute
  if (filter === "external_only") return !w.publishedByInstitute
  return true
}

export function matchesWritingGenresFilter(
  w: WritingDto,
  genres: BookGenre[],
): boolean {
  if (!genres.length) return true
  const bookGenres = w.bookGenres ?? []
  return genres.some((g) => bookGenres.includes(g))
}

export function matchesWritingWriterFilter(
  w: WritingDto,
  writer: string | null,
): boolean {
  if (!writer?.trim()) return true
  const ckb = w.ckbContent?.writer?.trim()
  const kmr = w.kmrContent?.writer?.trim()
  return ckb === writer || kmr === writer
}

export function matchesWritingTopicFilter(
  w: WritingDto,
  topicId: number | null,
): boolean {
  if (topicId == null) return true
  return w.topicId === topicId
}

export function matchesWritingClientSearchFilter(
  w: WritingDto,
  q: string | null,
): boolean {
  const k = q?.trim().toLowerCase()
  if (!k || k.length < 2) return true
  const haystack = [
    w.ckbContent?.title,
    w.kmrContent?.title,
    w.ckbContent?.writer,
    w.kmrContent?.writer,
    w.seriesName,
    ...(w.tagsCkb ?? []),
    ...(w.tagsKmr ?? []),
    ...(w.keywordsCkb ?? []),
    ...(w.keywordsKmr ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(k)
}

function normalizeLanguages(
  langs: Language[] | Set<Language> | undefined,
): Language[] {
  if (!langs) return []
  if (langs instanceof Set) return [...langs]
  return langs
}
