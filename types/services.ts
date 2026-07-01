export type Language = "CKB" | "KMR"

export type ServiceDisplayStatus =
  | "inactive"
  | "draft"
  | "scheduled"
  | "published"

export type ServiceContentDto = {
  id?: number
  languageCode: Language
  title: string
  description?: string | null
}

export type ServiceDto = {
  id?: number
  serviceType: string
  location?: string | null
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
