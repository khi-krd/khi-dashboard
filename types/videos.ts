export type Language = "CKB" | "KMR"

export type VideoType = "FILM" | "VIDEO_CLIP"

export type VideoContentDto = {
  title?: string | null
  description?: string | null
  location?: string | null
  director?: string | null
  producer?: string | null
}

export type VideoClipItemDto = {
  id?: number
  url?: string | null
  externalUrl?: string | null
  embedUrl?: string | null
  clipNumber?: number
  durationSeconds?: number | null
  resolution?: string | null
  fileFormat?: string | null
  fileSizeMb?: number | null
  titleCkb?: string | null
  titleKmr?: string | null
  descriptionCkb?: string | null
  descriptionKmr?: string | null
}

export type TopicDto = {
  id: number
  nameCkb?: string | null
  nameKmr?: string | null
  createdAt?: string
  updatedAt?: string
}

export type VideoDto = {
  id?: number
  videoType: VideoType
  albumOfMemories?: boolean
  topicId?: number | null
  topicNameCkb?: string | null
  topicNameKmr?: string | null
  ckbCoverUrl?: string | null
  kmrCoverUrl?: string | null
  hoverCoverUrl?: string | null
  ckbContent?: VideoContentDto | null
  kmrContent?: VideoContentDto | null
  sourceUrl?: string | null
  sourceExternalUrl?: string | null
  sourceEmbedUrl?: string | null
  videoClipItems?: VideoClipItemDto[]
  fileFormat?: string | null
  durationSeconds?: number | null
  publishmentDate?: string | null
  resolution?: string | null
  fileSizeMb?: number | null
  contentLanguages: Language[]
  tagsCkb?: string[]
  tagsKmr?: string[]
  keywordsCkb?: string[]
  keywordsKmr?: string[]
  createdAt?: string
  updatedAt?: string
  createdBy?: string | null
  updatedBy?: string | null
}

export type VideoPage = {
  content: VideoDto[]
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
