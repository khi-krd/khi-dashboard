export type Language = "CKB" | "KMR"

export type AboutStatus = "DRAFT" | "ACTIVE" | "ARCHIVED"

export type AboutContentDto = {
  title?: string | null
  subtitle?: string | null
  metaDescription?: string | null
  body?: string | null
}

export type StatItemDto = {
  labelCkb?: string | null
  labelKmr?: string | null
  value: string
}

export type AboutDto = {
  id?: number
  status: AboutStatus
  slugCkb?: string | null
  slugKmr?: string | null
  heroImageUrl?: string | null
  ckbContent?: AboutContentDto | null
  kmrContent?: AboutContentDto | null
  stats: StatItemDto[]
  contentLanguages: Language[]
  createdAt?: string
  updatedAt?: string
}

export type AboutPage = {
  content: AboutDto[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
