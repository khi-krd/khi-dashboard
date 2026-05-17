export type Language = "CKB" | "KMR"

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

export type BookGenre = (typeof BOOK_GENRES)[number]

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

export type SeriesInfoDto = {
  seriesId?: string | null
  seriesName?: string | null
  seriesOrder?: number | null
  seriesTotalBooks?: number | null
  parentBookId?: number | null
  isPartOfSeries?: boolean
  totalBooks?: number
}

export type WritingDto = {
  id?: number
  bookGenres: BookGenre[]
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
  publishmentYear?: number | null
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

export type NewTopicPayload = {
  nameCkb?: string
  nameKmr?: string
}

export type SeriesParentDto = WritingDto

export type SeriesDetailDto = {
  seriesId: string
  seriesName?: string | null
  parentBook?: WritingDto | null
  books: WritingDto[]
}

export type LinkSeriesPayload = {
  bookId: number
  parentBookId: number
  seriesOrder?: number
  seriesName?: string
}
