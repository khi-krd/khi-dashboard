export type Language = "CKB" | "KMR"

export type LanguageContentDto = {
  title: string
  description?: string | null
}

export type BilingualSet = {
  ckb: string[]
  kmr: string[]
}

export type CategoryDto = {
  ckbName: string
  kmrName: string
}

export type SubCategoryDto = {
  ckbName: string
  kmrName: string
}

export type NewsDto = {
  id?: number
  coverUrl?: string | null
  datePublished?: string | null
  createdAt?: string
  updatedAt?: string
  contentLanguages: Language[]
  category: CategoryDto
  subCategory: SubCategoryDto
  ckbContent?: LanguageContentDto | null
  kmrContent?: LanguageContentDto | null
  tags?: BilingualSet
  keywords?: BilingualSet
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

export type NewsListResponse = ApiResponse<PageResponse<NewsDto>>

export type NewsSingleResponse = ApiResponse<NewsDto>
