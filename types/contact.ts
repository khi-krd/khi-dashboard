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
  heroImageUrl?: string | null
  officeType?: string | null
  badgeCkb?: string | null
  badgeKmr?: string | null
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

/**
 * Visitor contact-form submissions. `status` shares the backend's
 * `SUBMISSION_STATUSES` set with the donations submissions, so the donations
 * status type/pill/select components are reused rather than duplicated.
 */
export type ContactMessageDto = {
  id?: number
  name?: string | null
  email?: string | null
  phone?: string | null
  subject?: string | null
  message?: string | null
  locale?: string | null
  status?: string | null
  createdAt?: string
}

export type ContactMessagePage = {
  content: ContactMessageDto[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
