export type Language = "CKB" | "KMR"

export type ProjectStatus = "ONGOING" | "COMPLETED"

export type ProjectMediaType =
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "PDF"
  | "DOCUMENT"

export type ProjectLanguageContentDto = {
  title: string
  description?: string | null
  location?: string | null
}

export type ProjectMediaDto = {
  id?: number
  mediaType: ProjectMediaType
  url?: string | null
  externalUrl?: string | null
  embedUrl?: string | null
  caption?: string | null
  sortOrder?: number
  createdAt?: string
}

export type ProjectDto = {
  id?: number
  status: ProjectStatus
  projectTypeCkb?: string | null
  projectTypeKmr?: string | null
  coverUrl?: string | null
  projectDate?: string | null
  createdAt?: string
  updatedAt?: string
  createdBy?: string | null
  updatedBy?: string | null
  contentLanguages: Language[]
  ckbContent?: ProjectLanguageContentDto | null
  kmrContent?: ProjectLanguageContentDto | null
  contentsCkb?: string[]
  contentsKmr?: string[]
  tagsCkb?: string[]
  tagsKmr?: string[]
  keywordsCkb?: string[]
  keywordsKmr?: string[]
  media?: ProjectMediaDto[]
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

export type ProjectListResponse = ApiResponse<PageResponse<ProjectDto>>

export type ProjectSingleResponse = ApiResponse<ProjectDto>

export type ProjectTypeOption = {
  projectTypeCkb: string
  projectTypeKmr: string
}
