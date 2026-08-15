import { unwrapApiData } from "@/lib/api-unwrap"
import type {
  BookFileFormat,
  BookGenre,
  Language,
  LinkSeriesPayload,
  SeriesBookSummary,
  SeriesDetailDto,
  TopicDto,
  WritingContentDto,
  WritingDto,
  WritingPage,
} from "@/types/writings"
import { BOOK_GENRES } from "@/types/writings"

function coerceStr(v: unknown): string | null {
  if (v == null) return null
  if (typeof v === "string") return v
  return String(v)
}

function coerceNum(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function coerceBool(v: unknown): boolean {
  if (v === true || v === "true" || v === 1) return true
  return false
}

function coerceStringArray(raw: unknown): string[] {
  if (!raw) return []
  if (raw instanceof Set) return [...raw].map(String)
  if (Array.isArray(raw)) return raw.map(String)
  return []
}

function normalizeBookGenres(raw: unknown): BookGenre[] {
  const arr = coerceStringArray(raw)
  return arr.filter((g): g is BookGenre =>
    (BOOK_GENRES as readonly string[]).includes(g),
  )
}

function normalizeFileFormat(raw: unknown): BookFileFormat | null {
  const s = coerceStr(raw)?.toUpperCase()
  if (
    s === "PDF" ||
    s === "DOCX" ||
    s === "EPUB" ||
    s === "TXT" ||
    s === "OTHER"
  ) {
    return s
  }
  return null
}

function normalizeContent(raw: unknown): WritingContentDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  return {
    title: coerceStr(o.title) ?? undefined,
    description: coerceStr(o.description) ?? undefined,
    writer: coerceStr(o.writer) ?? undefined,
    fileUrl: coerceStr(o.fileUrl) ?? coerceStr(o.file_url),
    fileFormat:
      normalizeFileFormat(o.fileFormat) ??
      normalizeFileFormat(o.file_format) ??
      undefined,
    fileSizeBytes:
      coerceNum(o.fileSizeBytes) ?? coerceNum(o.file_size_bytes) ?? undefined,
    pageCount: coerceNum(o.pageCount) ?? coerceNum(o.page_count) ?? undefined,
    genre: coerceStr(o.genre) ?? undefined,
  }
}

function normalizeLanguages(raw: unknown): Language[] {
  if (!raw) return ["CKB"]
  if (raw instanceof Set) return [...raw] as Language[]
  if (Array.isArray(raw)) {
    return raw.filter((x): x is Language => x === "CKB" || x === "KMR")
  }
  return ["CKB"]
}

function normalizeTags(raw: unknown): {
  tagsCkb: string[]
  tagsKmr: string[]
  keywordsCkb: string[]
  keywordsKmr: string[]
} {
  if (!raw || typeof raw !== "object") {
    return { tagsCkb: [], tagsKmr: [], keywordsCkb: [], keywordsKmr: [] }
  }
  const o = raw as Record<string, unknown>
  const tags = o.tags && typeof o.tags === "object" ? (o.tags as Record<string, unknown>) : o
  const keywords =
    o.keywords && typeof o.keywords === "object"
      ? (o.keywords as Record<string, unknown>)
      : o
  return {
    tagsCkb: coerceStringArray(tags.ckb ?? o.tagsCkb ?? o.tags_ckb),
    tagsKmr: coerceStringArray(tags.kmr ?? o.tagsKmr ?? o.tags_kmr),
    keywordsCkb: coerceStringArray(
      keywords.ckb ?? o.keywordsCkb ?? o.keywords_ckb,
    ),
    keywordsKmr: coerceStringArray(
      keywords.kmr ?? o.keywordsKmr ?? o.keywords_kmr,
    ),
  }
}

function normalizeTopicEmbed(raw: unknown): TopicDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const id = coerceNum(o.id)
  if (id == null) return null
  return {
    id,
    nameCkb: coerceStr(o.nameCkb) ?? coerceStr(o.name_ckb),
    nameKmr: coerceStr(o.nameKmr) ?? coerceStr(o.name_kmr),
    createdAt: coerceStr(o.createdAt) ?? undefined,
    updatedAt: coerceStr(o.updatedAt) ?? undefined,
  }
}

function normalizeSeriesInfo(raw: unknown): WritingDto["seriesInfo"] {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const totalBooks =
    coerceNum(o.totalBooks) ??
    coerceNum(o.total_books) ??
    coerceNum(o.seriesTotalBooks) ??
    coerceNum(o.series_total_books)
  const isPartOfSeries =
    coerceBool(o.isPartOfSeries) ||
    coerceBool(o.is_part_of_series) ||
    coerceBool(o.isParent) ||
    coerceBool(o.is_parent) ||
    (totalBooks != null && totalBooks > 1)
  return {
    seriesId: coerceStr(o.seriesId) ?? coerceStr(o.series_id),
    seriesName: coerceStr(o.seriesName) ?? coerceStr(o.series_name),
    seriesOrder:
      coerceNum(o.seriesOrder) ?? coerceNum(o.series_order) ?? undefined,
    seriesTotalBooks: totalBooks ?? undefined,
    parentBookId:
      coerceNum(o.parentBookId) ?? coerceNum(o.parent_book_id) ?? undefined,
    isPartOfSeries,
    isParent: coerceBool(o.isParent) || coerceBool(o.is_parent),
    totalBooks: totalBooks ?? undefined,
  }
}

export function normalizeTopicDto(raw: unknown): TopicDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  return {
    id: coerceNum(o.id) ?? 0,
    nameCkb: coerceStr(o.nameCkb) ?? coerceStr(o.name_ckb),
    nameKmr: coerceStr(o.nameKmr) ?? coerceStr(o.name_kmr),
    createdAt: coerceStr(o.createdAt) ?? undefined,
    updatedAt: coerceStr(o.updatedAt) ?? undefined,
  }
}

export function normalizeTopicList(raw: unknown): TopicDto[] {
  const unwrapped = unwrapApiData<unknown>(raw)
  const list = Array.isArray(unwrapped) ? unwrapped : []
  return list.map(normalizeTopicDto)
}

export function normalizeWritingDto(raw: unknown): WritingDto {
  const unwrapped = unwrapApiData<unknown>(raw)
  const o = (unwrapped && typeof unwrapped === "object" ? unwrapped : {}) as Record<
    string,
    unknown
  >
  const topic = normalizeTopicEmbed(o.topic)
  const tagData = normalizeTags(o)
  const embeddedSeries = o.series ?? o.seriesInfo ?? o.series_info
  const seriesInfo = normalizeSeriesInfo(embeddedSeries)
  const bookGenres = normalizeBookGenres(o.bookGenres ?? o.book_genres)

  return {
    id: coerceNum(o.id) ?? undefined,
    featured: coerceBool(o.featured),
    featuredOrder: coerceNum(o.featuredOrder) ?? coerceNum(o.featured_order),
    bookGenres,
    topicId:
      coerceNum(o.topicId) ??
      coerceNum(o.topic_id) ??
      topic?.id ??
      undefined,
    topicNameCkb:
      coerceStr(o.topicNameCkb) ??
      coerceStr(o.topic_name_ckb) ??
      topic?.nameCkb,
    topicNameKmr:
      coerceStr(o.topicNameKmr) ??
      coerceStr(o.topic_name_kmr) ??
      topic?.nameKmr,
    topic,
    ckbCoverUrl: coerceStr(o.ckbCoverUrl) ?? coerceStr(o.ckb_cover_url),
    kmrCoverUrl: coerceStr(o.kmrCoverUrl) ?? coerceStr(o.kmr_cover_url),
    hoverCoverUrl: coerceStr(o.hoverCoverUrl) ?? coerceStr(o.hover_cover_url),
    // Rebuilt field-by-field, so anything not listed here is silently dropped —
    // which is what hid the hero picture after it was saved.
    featureImageUrl:
      coerceStr(o.featureImageUrl) ?? coerceStr(o.feature_image_url),
    ckbContent: normalizeContent(o.ckbContent ?? o.ckb_content),
    kmrContent: normalizeContent(o.kmrContent ?? o.kmr_content),
    publishedByInstitute:
      coerceBool(o.publishedByInstitute) ||
      coerceBool(o.published_by_institute),
    contentLanguages: normalizeLanguages(
      o.contentLanguages ?? o.content_languages,
    ),
    tagsCkb: tagData.tagsCkb,
    tagsKmr: tagData.tagsKmr,
    keywordsCkb: tagData.keywordsCkb,
    keywordsKmr: tagData.keywordsKmr,
    seriesId:
      coerceStr(o.seriesId) ??
      coerceStr(o.series_id) ??
      seriesInfo?.seriesId,
    seriesName:
      coerceStr(o.seriesName) ??
      coerceStr(o.series_name) ??
      seriesInfo?.seriesName,
    seriesOrder:
      coerceNum(o.seriesOrder) ??
      coerceNum(o.series_order) ??
      seriesInfo?.seriesOrder ??
      undefined,
    seriesTotalBooks:
      coerceNum(o.seriesTotalBooks) ??
      coerceNum(o.series_total_books) ??
      seriesInfo?.totalBooks ??
      undefined,
    parentBookId:
      coerceNum(o.parentBookId) ??
      coerceNum(o.parent_book_id) ??
      seriesInfo?.parentBookId ??
      undefined,
    seriesInfo,
    createdAt: coerceStr(o.createdAt) ?? coerceStr(o.created_at) ?? undefined,
    updatedAt: coerceStr(o.updatedAt) ?? coerceStr(o.updated_at) ?? undefined,
    createdBy: coerceStr(o.createdBy) ?? coerceStr(o.created_by),
    updatedBy: coerceStr(o.updatedBy) ?? coerceStr(o.updated_by),
  }
}

export function normalizeWritingPage(raw: unknown): WritingPage {
  const unwrapped = unwrapApiData<unknown>(raw)
  const o = (unwrapped && typeof unwrapped === "object" ? unwrapped : {}) as Record<
    string,
    unknown
  >
  const content = Array.isArray(o.content)
    ? o.content.map(normalizeWritingDto)
    : []
  return {
    content,
    totalElements: coerceNum(o.totalElements) ?? coerceNum(o.total_elements) ?? 0,
    totalPages: coerceNum(o.totalPages) ?? coerceNum(o.total_pages) ?? 0,
    size: coerceNum(o.size) ?? 20,
    number: coerceNum(o.number) ?? 0,
    first: coerceBool(o.first),
    last: coerceBool(o.last),
    empty: coerceBool(o.empty) || content.length === 0,
  }
}

function normalizeSeriesBookSummary(raw: unknown): SeriesBookSummary {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const id = coerceNum(o.id) ?? 0
  const titleCkb =
    coerceStr(o.titleCkb) ??
    coerceStr(o.title_ckb) ??
    normalizeContent(o.ckbContent ?? o.ckb_content)?.title
  const titleKmr =
    coerceStr(o.titleKmr) ??
    coerceStr(o.title_kmr) ??
    normalizeContent(o.kmrContent ?? o.kmr_content)?.title
  return {
    id,
    titleCkb,
    titleKmr,
    seriesOrder:
      coerceNum(o.seriesOrder) ?? coerceNum(o.series_order) ?? undefined,
    createdAt: coerceStr(o.createdAt) ?? coerceStr(o.created_at) ?? undefined,
  }
}

export function normalizeSeriesDetail(raw: unknown): SeriesDetailDto {
  const unwrapped = unwrapApiData<unknown>(raw)
  const o = (unwrapped && typeof unwrapped === "object" ? unwrapped : {}) as Record<
    string,
    unknown
  >
  const books = Array.isArray(o.books)
    ? o.books.map(normalizeSeriesBookSummary)
    : []
  books.sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))
  return {
    seriesId: coerceStr(o.seriesId) ?? coerceStr(o.series_id) ?? "",
    seriesName: coerceStr(o.seriesName) ?? coerceStr(o.series_name),
    totalBooks:
      coerceNum(o.totalBooks) ??
      coerceNum(o.total_books) ??
      books.length,
    books,
  }
}

export function normalizeLinkSeriesPayload(
  raw: unknown,
): LinkSeriesPayload {
  const unwrapped = unwrapApiData<unknown>(raw)
  const o = (unwrapped && typeof unwrapped === "object" ? unwrapped : {}) as Record<
    string,
    unknown
  >
  return {
    bookId: coerceNum(o.bookId) ?? coerceNum(o.book_id) ?? 0,
    parentBookId:
      coerceNum(o.parentBookId) ?? coerceNum(o.parent_book_id) ?? 0,
  }
}
