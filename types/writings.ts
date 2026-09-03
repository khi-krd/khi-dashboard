import type { BookGenreRefDto } from "@/types/book-genre"

export type Language = "CKB" | "KMR"

/**
 * The genre slugs this dashboard ships a Sorani label and an icon for.
 *
 * Genres are rows in the database now, managed from
 * `/dashboard/writings/genres`, so this is no longer the set of genres that
 * exist — only the set the dashboard can draw specially. Live data already
 * carries slugs that are not in here (`EDUCATIONAL`, `ARTS`, `CULTURAL`), and
 * every new genre an editor creates will be another one.
 */
export const BOOK_GENRES = [
  "NOVEL",
  "SHORT_STORY",
  "POETRY",
  "ESSAY",
  "DRAMA",
  "HISTORY",
  "BIOGRAPHY",
  "POLITICAL",
  "GEOGRAPHY",
  "ACADEMIC",
  "REFERENCE",
  "LINGUISTICS",
  "RELIGIOUS",
  "FOLKLORE",
  "CHILDREN",
  "OTHER",
] as const

/** One of the built-ins above — the only slugs with a label and an icon. */
export type KnownBookGenre = (typeof BOOK_GENRES)[number]

/**
 * Any genre slug, built-in or created from the dashboard. Deliberately widened
 * from the old union: books carry whatever the database holds, and typing that
 * as a closed set is what made the dashboard silently drop the genres it did
 * not recognise.
 */
export type BookGenre = string

export type BookFileFormat = "PDF" | "DOCX" | "EPUB" | "TXT" | "OTHER"

export type WritingContentDto = {
  title?: string | null
  description?: string | null
  writer?: string | null
  fileUrl?: string | null
  fileFormat?: BookFileFormat | null
  fileSizeBytes?: number | null
  pageCount?: number | null
  genre?: string | null
}

export type TopicDto = {
  id: number
  nameCkb?: string | null
  nameKmr?: string | null
  createdAt?: string
  updatedAt?: string
}

export type NewTopicPayload = {
  nameCkb?: string
  nameKmr?: string
}

export type SeriesInfoDto = {
  seriesId?: string | null
  seriesName?: string | null
  seriesOrder?: number | null
  seriesTotalBooks?: number | null
  parentBookId?: number | null
  isPartOfSeries?: boolean
  isParent?: boolean
  totalBooks?: number
}

export type WritingDto = {
  id?: number
  featured?: boolean
  featuredOrder?: number | null
  /** Hero picture for the homepage carousel; falls back to the cover when unset. */
  featureImageUrl?: string | null
  bookGenres: BookGenre[]
  /**
   * The same genres as objects, once the backend sends them. `bookGenres` stays
   * the slug-only view every display component reads; this is what the book
   * form needs to submit `genreIds`.
   */
  genres?: BookGenreRefDto[]
  topicId?: number | null
  topicNameCkb?: string | null
  topicNameKmr?: string | null
  topic?: TopicDto | null
  ckbCoverUrl?: string | null
  kmrCoverUrl?: string | null
  hoverCoverUrl?: string | null
  ckbContent?: WritingContentDto | null
  kmrContent?: WritingContentDto | null
  publishedByInstitute?: boolean
  contentLanguages: Language[]
  tagsCkb?: string[]
  tagsKmr?: string[]
  keywordsCkb?: string[]
  keywordsKmr?: string[]
  seriesId?: string | null
  seriesName?: string | null
  seriesOrder?: number | null
  seriesTotalBooks?: number | null
  parentBookId?: number | null
  seriesInfo?: SeriesInfoDto | null
  createdAt?: string
  updatedAt?: string
  createdBy?: string | null
  updatedBy?: string | null
}

export type WritingPage = {
  content: WritingDto[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export type FeaturedPayload = {
  featured?: boolean
  featuredOrder?: number
}

export type SeriesBookSummary = {
  id: number
  titleCkb?: string | null
  titleKmr?: string | null
  seriesOrder?: number | null
  createdAt?: string
}

export type SeriesParentDto = WritingDto

export type SeriesDetailDto = {
  seriesId: string
  seriesName?: string | null
  totalBooks?: number
  books: SeriesBookSummary[]
}

export type LinkSeriesPayload = {
  bookId: number
  parentBookId: number
}
