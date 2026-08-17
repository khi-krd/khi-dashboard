export const DONATION_STATUSES = [
  "NEW",
  "PENDING",
  "IN_REVIEW",
  "APPROVED",
  "COMPLETED",
  "REJECTED",
  "CLOSED",
] as const

export type DonationStatus = (typeof DONATION_STATUSES)[number]

export type DonationTypeCode = "FINANCIAL" | "ARCHIVE"

export type ArchiveMaterialType =
  | "PHOTOGRAPH"
  | "MANUSCRIPT"
  | "DOCUMENT"
  | "AUDIO"
  | "VIDEO"
  | "OTHER"

export type DonationSettingsDto = {
  id?: number
  titleCkb?: string | null
  titleKmr?: string | null
  descriptionCkb?: string | null
  descriptionKmr?: string | null
  heroImageUrl?: string | null
  bankName?: string | null
  accountName?: string | null
  accountNumber?: string | null
  iban?: string | null
  swiftCode?: string | null
  paymentInstructionsCkb?: string | null
  paymentInstructionsKmr?: string | null
  financialDonationsEnabled?: boolean
  archiveDonationsEnabled?: boolean
  /**
   * The donation page is a singleton, so it counts as at most one slide and
   * its toggle takes no id. Unlike About and Service these three are also
   * writable through `PUT /donations/settings`, where they are null-tolerant —
   * omitting them leaves the stored values alone.
   */
  featured?: boolean
  featuredOrder?: number | null
  /** Falls back to `heroImageUrl`, so featuring needs no extra upload. */
  featureImageUrl?: string | null
}

export type DonationTypeDto = {
  code: DonationTypeCode
  titleCkb?: string | null
  titleKmr?: string | null
  enabled: boolean
}

export type ArchiveDonationDto = {
  id?: number
  donorName?: string | null
  email?: string | null
  phone?: string | null
  materialType?: ArchiveMaterialType | null
  title?: string | null
  description?: string | null
  estimatedDate?: string | null
  attachmentUrl?: string | null
  status?: DonationStatus
  createdAt?: string
  updatedAt?: string
}

export type FinancialDonationDto = {
  id?: number
  donorName?: string | null
  email?: string | null
  phone?: string | null
  amount?: number | null
  currency?: string | null
  paymentMethod?: string | null
  transactionReference?: string | null
  message?: string | null
  status?: DonationStatus
  createdAt?: string
  updatedAt?: string
}

export type DonationPage<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export function isDonationStatus(value: string): value is DonationStatus {
  return (DONATION_STATUSES as readonly string[]).includes(value)
}
