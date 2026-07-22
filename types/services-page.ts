import type { ApiResponse } from "@/types/services"

export type ServicesPageSettingsDto = {
  id?: number
  heroImageUrl?: string | null
  eyebrowCkb?: string | null
  eyebrowKmr?: string | null
  titleCkb?: string | null
  titleKmr?: string | null
  subtitleCkb?: string | null
  subtitleKmr?: string | null
}

export type ServicesPageSettingsResponse = ApiResponse<ServicesPageSettingsDto>
