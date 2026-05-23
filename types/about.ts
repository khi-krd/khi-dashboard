export type Language = "CKB" | "KMR"

export type AboutContentDto = {
  title?: string | null
  subtitle?: string | null
  metaDescription?: string | null
  body?: string | null
}

export type AboutDto = {
  id?: number
  active: boolean
  slugCkb?: string | null
  slugKmr?: string | null
  ckbContent?: AboutContentDto | null
  kmrContent?: AboutContentDto | null
  displayOrder?: number
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
