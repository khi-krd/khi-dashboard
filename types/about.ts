export type Language = "CKB" | "KMR"

export type AboutStatus = "DRAFT" | "ACTIVE" | "ARCHIVED"

export const ABOUT_BLOCK_TYPES = [
  "TEXT",
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "GALLERY",
  "QUOTE",
  "STAT",
] as const

export type AboutBlockType = (typeof ABOUT_BLOCK_TYPES)[number]

export type ImageAlignment = "center" | "wide" | "full"

export type GalleryImageDto = {
  id?: number
  imageUrl?: string | null
  sortOrder?: number
}

export type AboutBlockDto = {
  id?: number | string
  type: AboutBlockType
  sortOrder?: number
  contentLanguages?: Language[]
  headingCkb?: string | null
  headingKmr?: string | null
  bodyCkb?: string | null
  bodyKmr?: string | null
  imageUrl?: string | null
  captionCkb?: string | null
  captionKmr?: string | null
  alignment?: ImageAlignment | null
  embedUrl?: string | null
  audioUrl?: string | null
  titleCkb?: string | null
  titleKmr?: string | null
  durationSeconds?: number | null
  images?: GalleryImageDto[]
  textCkb?: string | null
  textKmr?: string | null
  attributionCkb?: string | null
  attributionKmr?: string | null
  value?: string | null
  unitCkb?: string | null
  unitKmr?: string | null
  labelCkb?: string | null
  labelKmr?: string | null
}

export type AboutDto = {
  id?: number
  status: AboutStatus
  slugCkb?: string | null
  slugKmr?: string | null
  titleCkb?: string | null
  titleKmr?: string | null
  subtitleCkb?: string | null
  subtitleKmr?: string | null
  seoDescriptionCkb?: string | null
  seoDescriptionKmr?: string | null
  heroImageUrl?: string | null
  blocks: AboutBlockDto[]
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
