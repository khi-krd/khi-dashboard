export type Language = "CKB" | "KMR"

export type CollectionType = "SINGLE" | "GALLERY" | "PHOTO_STORY"

export type CollectionContentDto = {
  title?: string | null
  description?: string | null
  location?: string | null
  collectedBy?: string | null
}

export type ImageAlbumItemDto = {
  id?: number
  imageUrl?: string | null
  externalUrl?: string | null
  embedUrl?: string | null
  captionCkb?: string | null
  captionKmr?: string | null
  descriptionCkb?: string | null
  descriptionKmr?: string | null
  sortOrder?: number | null
  fileSizeBytes?: number | null
  widthPx?: number | null
  heightPx?: number | null
  mimeType?: string | null
  aspectRatio?: number | null
  humanReadableSize?: string | null
}

export type TopicDto = {
  id: number
  nameCkb?: string | null
  nameKmr?: string | null
  createdAt?: string
  updatedAt?: string
}

export type CollectionDto = {
  id?: number
  collectionType: CollectionType
  topicId?: number | null
  topicNameCkb?: string | null
  topicNameKmr?: string | null
  ckbCoverUrl?: string | null
  kmrCoverUrl?: string | null
  hoverCoverUrl?: string | null
  ckbContent?: CollectionContentDto | null
  kmrContent?: CollectionContentDto | null
  publishmentDate?: string | null
  contentLanguages: Language[]
  tagsCkb?: string[]
  tagsKmr?: string[]
  keywordsCkb?: string[]
  keywordsKmr?: string[]
  imageAlbum?: ImageAlbumItemDto[]
  createdAt?: string
  updatedAt?: string
  createdBy?: string | null
  updatedBy?: string | null
  featured?: boolean
  featuredOrder?: number | null
  /** Hero picture for the homepage carousel; falls back to the cover when unset. */
  featureImageUrl?: string | null
}

export type CollectionPage = {
  content: CollectionDto[]
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

export type ApiResponse<T> = {
  success: boolean
  message?: string | null
  data?: T | null
  errors?: Record<string, string> | null
}

export type CollectionListResponse = ApiResponse<CollectionPage>
export type CollectionSingleResponse = ApiResponse<CollectionDto>
