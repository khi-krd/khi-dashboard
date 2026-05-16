export type Language = "CKB" | "KMR"

export type ServiceMediaType = "IMAGE" | "VIDEO" | "AUDIO"

export type ServiceDisplayStatus =
  | "inactive"
  | "draft"
  | "scheduled"
  | "published"

export type ServiceFileContentDto = {
  caption?: string | null
  title?: string | null
  description?: string | null
}

export type ServiceCollectionFileDto = {
  id?: number
  fileUrl: string
  thumbnailUrl?: string | null
  ckbContent?: ServiceFileContentDto | null
  kmrContent?: ServiceFileContentDto | null
  sortOrder?: number
  fileFormat?: string | null
  widthPx?: number | null
  heightPx?: number | null
  resolution?: string | null
  durationSeconds?: number | null
  formattedDuration?: string | null
  codec?: string | null
  bitrateKbps?: number | null
  fileSize?: number | null
  formattedFileSize?: string | null
}

export type ServiceMediaCollectionDto = {
  id?: number
  collectionName: string
  mediaType: ServiceMediaType
  sortOrder?: number
  files: ServiceCollectionFileDto[]
}

export type ServiceContentDto = {
  languageCode: Language
  title: string
  description?: string | null
}

export type ServiceDto = {
  id?: number
  serviceType: string
  location?: string | null
  coverMediaUrl?: string | null
  active: boolean
  publishedAt?: string | null
  contents: ServiceContentDto[]
  mediaCollections: ServiceMediaCollectionDto[]
  contentLanguages?: Language[]
  createdAt?: string
  updatedAt?: string
  createdBy?: string | null
  updatedBy?: string | null
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data?: T
}

export type PageResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export type ServiceListResponse = ApiResponse<PageResponse<ServiceDto>>

export type ServiceSingleResponse = ApiResponse<ServiceDto>

export type ServiceTypesResponse = ApiResponse<string[]>

export type ServiceUploadResultDto = {
  fileUrl: string
  thumbnailUrl?: string | null
  fileFormat?: string | null
  widthPx?: number | null
  heightPx?: number | null
  resolution?: string | null
  durationSeconds?: number | null
  formattedDuration?: string | null
  codec?: string | null
  bitrateKbps?: number | null
  fileSize?: number | null
  formattedFileSize?: string | null
}

export type ServiceUploadResponse = ApiResponse<ServiceUploadResultDto[]>
