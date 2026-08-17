export type Language = "CKB" | "KMR"

export type ServiceDisplayStatus =
  | "inactive"
  | "draft"
  | "scheduled"
  | "published"

/** API layoutType → public site: MEDIA_HERO→cinema, FEATURE_GRID→gallery, DEFAULT→editorial */
export type ServiceLayoutType = "DEFAULT" | "FEATURE_GRID" | "MEDIA_HERO"

export const SERVICE_LAYOUT_TYPES: ServiceLayoutType[] = [
  "MEDIA_HERO",
  "FEATURE_GRID",
  "DEFAULT",
]

/** @deprecated Legacy preset list — public site is dynamic; anchors are free-form slugs. */
export const SERVICE_NAV_ANCHORS = [
  "institute-hall",
  "studio",
  "research-publishing",
  "printing-house",
  "sales",
  "library",
  "audio-visual-archive",
  "joint-projects",
] as const

export type ServiceNavAnchorId = (typeof SERVICE_NAV_ANCHORS)[number]

export type ServiceContentDto = {
  id?: number
  languageCode: Language
  title: string
  description?: string | null
  /**
   * The single plain-text line the homepage carousel shows for this language.
   * Saved through the normal service POST/PUT — not the featured PATCH. Left
   * blank, the slide falls back to a tag-stripped excerpt of `description`.
   */
  featureDescription?: string | null
}

export type ServiceGalleryMediaType = "IMAGE" | "VIDEO"

export type ServiceGalleryMediaDto = {
  type: ServiceGalleryMediaType
  url: string
  posterUrl?: string | null
  alt?: string | null
}

export type ServiceDto = {
  id?: number
  serviceType?: string | null
  location?: string | null
  layoutType?: ServiceLayoutType | null
  navAnchorId?: string | null
  sortOrder?: number | null
  galleryMedia?: ServiceGalleryMediaDto[]
  heroVideoUrl?: string | null
  heroPosterUrl?: string | null
  featureImageUrls?: string[]
  thumbnailUrls?: string[]
  partnerIds?: number[]
  active: boolean
  publishedAt?: string | null
  contents: ServiceContentDto[]
  contentLanguages?: Language[]
  createdAt?: string
  updatedAt?: string
  createdBy?: string | null
  updatedBy?: string | null
  featured?: boolean
  featuredOrder?: number | null
  /**
   * Singular — the wide carousel hero. Unrelated to `featureImageUrls`
   * (plural), which is a legacy gallery list. Read-only on this DTO: the
   * service PUT ignores it, `PATCH /api/v1/services/{id}/featured` writes it.
   */
  featureImageUrl?: string | null
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
