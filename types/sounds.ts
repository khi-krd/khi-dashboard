export type Language = "CKB" | "KMR"

export type TrackState = "SINGLE" | "MULTI"

export type AudioChannel = "STEREO" | "MONO"

export type AttachmentType = "PDF" | "VIDEO" | "IMAGE" | "AUDIO" | "OTHER"

export type FileType = "AUDIO" | "VIDEO" | "OTHER"

export type SoundContentDto = {
  title?: string | null
  description?: string | null
}

export type BrochureDto = {
  id?: number
  imageUrl?: string | null
  caption?: string | null
  brochureOrder?: number | null
}

export type SoundFileDto = {
  id?: number
  fileUrl?: string | null
  externalUrl?: string | null
  embedUrl?: string | null
  title?: string | null
  fileType?: FileType
  publishmentYear?: number | null
  fileFormat?: string | null
  sizeBytes?: number | null
  durationSeconds?: number | null
  bitRate?: string | null
  sampleRate?: string | null
  audioChannel?: AudioChannel | null
  form?: string | null
  genre?: string | null
  recordingVenue?: string | null
  brochures?: BrochureDto[]
}

export type AttachmentDto = {
  id?: number
  fileUrl?: string | null
  title?: string | null
  attachmentType?: AttachmentType
  sizeBytes?: number | null
  mimeType?: string | null
  attachmentOrder?: number | null
}

export type TopicDto = {
  id: number
  nameCkb?: string | null
  nameKmr?: string | null
  createdAt?: string
  updatedAt?: string
}

export type SoundDto = {
  id?: number
  trackState: TrackState
  albumOfMemories?: boolean
  soundType?: string | null
  topicId?: number | null
  topicNameCkb?: string | null
  topicNameKmr?: string | null
  ckbCoverUrl?: string | null
  kmrCoverUrl?: string | null
  hoverCoverUrl?: string | null
  ckbContent?: SoundContentDto | null
  kmrContent?: SoundContentDto | null
  reader?: string | null
  directors?: string[]
  locations?: string[]
  terms?: string | null
  thisProjectOfInstitute?: boolean
  contentLanguages: Language[]
  tagsCkb?: string[]
  tagsKmr?: string[]
  keywordsCkb?: string[]
  keywordsKmr?: string[]
  files?: SoundFileDto[]
  attachments?: AttachmentDto[]
  albumName?: string | null
  publishmentYear?: number | null
  cdNumber?: number | null
  totalTracks?: number | null
  totalDurationSeconds?: number | null
  totalSizeBytes?: number | null
  createdAt?: string
  updatedAt?: string
  createdBy?: string | null
  updatedBy?: string | null
}

export type SoundPage = {
  content: SoundDto[]
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
