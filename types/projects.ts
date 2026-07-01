export type Language = "CKB" | "KMR"

export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED"

/** @deprecated legacy API value — mapped to ACTIVE on read */
export type LegacyProjectStatus = "ONGOING"

export type MediaKind = "IMAGE" | "VIDEO" | "AUDIO"

export type MediaGalleryItemDto = {
  url: string
  kind?: MediaKind
  thumbnailUrl?: string | null
  captionCkb?: string | null
  captionKmr?: string | null
  sortOrder?: number
}

export type ProjectLanguageContentDto = {
  title: string
  description?: string | null
  location?: string | null
}

export type ProjectDto = {
  id?: number
  status: ProjectStatus
  projectTypeCkb?: string | null
  projectTypeKmr?: string | null
  coverUrl?: string | null
  coverMediaType?: MediaKind | null
  coverThumbnailUrl?: string | null
  mediaGallery?: MediaGalleryItemDto[]
  projectDate?: string | null
  createdAt?: string
  updatedAt?: string
  createdBy?: string | null
  updatedBy?: string | null
  contentLanguages: Language[]
  ckbContent?: ProjectLanguageContentDto | null
  kmrContent?: ProjectLanguageContentDto | null
  tagsCkb?: string[]
  tagsKmr?: string[]
  keywordsCkb?: string[]
  keywordsKmr?: string[]
  featured?: boolean
  featuredOrder?: number | null
}

export function normalizeProjectStatus(
  status: string | undefined | null,
): ProjectStatus {
  const s = status?.toUpperCase()
  if (s === "COMPLETED") return "COMPLETED"
  if (s === "ARCHIVED") return "ARCHIVED"
  if (s === "ACTIVE" || s === "ONGOING") return "ACTIVE"
  return "ACTIVE"
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
