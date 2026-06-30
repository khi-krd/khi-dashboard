export type Language = "CKB" | "KMR"

export type AboutContentDto = {
  title?: string | null
  subtitle?: string | null
  metaDescription?: string | null
  body?: string | null
}

export type AboutStatDto = {
  labelCkb?: string | null
  labelKmr?: string | null
  value?: string | null
}

export type AboutDto = {
  id?: number
  active: boolean
  slugCkb?: string | null
  slugKmr?: string | null
  founderNameCkb?: string | null
  founderNameKmr?: string | null
  founderBioCkb?: string | null
  founderBioKmr?: string | null
  founderImageUrl?: string | null
  heroVideoUrl?: string | null
  heroPosterUrl?: string | null
  ckbContent?: AboutContentDto | null
  kmrContent?: AboutContentDto | null
  stats?: AboutStatDto[]
  displayOrder?: number
  createdAt?: string
  updatedAt?: string
}

export type AboutTeamMemberDto = {
  id?: number
  nameCkb?: string | null
  nameKmr?: string | null
  roleCkb?: string | null
  roleKmr?: string | null
  bioCkb?: string | null
  bioKmr?: string | null
  office?: string | null
  imageUrl?: string | null
  displayOrder?: number
  active?: boolean
}

export type AboutPartnerDto = {
  id?: number
  nameCkb?: string | null
  nameKmr?: string | null
  descriptionCkb?: string | null
  descriptionKmr?: string | null
  logoUrl?: string | null
  websiteUrl?: string | null
  displayOrder?: number
  active?: boolean
}

export type AboutPage = {
  content: AboutDto[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
