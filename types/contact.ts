export type Language = "CKB" | "KMR"

export type ContactContentDto = {
  title?: string | null
  subtitle?: string | null
  address?: string | null
  workingHours?: string | null
  description?: string | null
}

export type ContactDto = {
  id?: number
  active?: boolean
  slugCkb?: string | null
  slugKmr?: string | null
  displayOrder?: number
  ckbContent?: ContactContentDto | null
  kmrContent?: ContactContentDto | null
  phone?: string | null
  secondaryPhone?: string | null
  email?: string | null
  mapEmbedUrl?: string | null
  latitude?: number | null
  longitude?: number | null
  createdAt?: string
  updatedAt?: string
}

export type ContactPage = {
  content: ContactDto[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
