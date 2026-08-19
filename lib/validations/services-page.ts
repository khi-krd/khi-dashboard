import { z } from "zod"

import type { ServicesPageSettingsDto } from "@/types/services-page"

export const servicesPageHeroSchema = z.object({
  heroImageUrl: z.string().max(1500).optional().or(z.literal("")),
  eyebrowCkb: z.string().max(200).optional().or(z.literal("")),
  eyebrowKmr: z.string().max(200).optional().or(z.literal("")),
  titleCkb: z.string().max(300).optional().or(z.literal("")),
  titleKmr: z.string().max(300).optional().or(z.literal("")),
  subtitleCkb: z.string().max(2000).optional().or(z.literal("")),
  subtitleKmr: z.string().max(2000).optional().or(z.literal("")),
})

export type ServicesPageHeroFormValues = z.infer<typeof servicesPageHeroSchema>

export function defaultServicesPageHeroValues(): ServicesPageHeroFormValues {
  return {
    heroImageUrl: "",
    eyebrowCkb: "",
    eyebrowKmr: "",
    titleCkb: "",
    titleKmr: "",
    subtitleCkb: "",
    subtitleKmr: "",
  }
}

export function settingsDtoToHeroFormValues(
  dto: ServicesPageSettingsDto,
): ServicesPageHeroFormValues {
  return {
    heroImageUrl: dto.heroImageUrl ?? "",
    eyebrowCkb: dto.eyebrowCkb ?? "",
    eyebrowKmr: dto.eyebrowKmr ?? "",
    titleCkb: dto.titleCkb ?? "",
    titleKmr: dto.titleKmr ?? "",
    subtitleCkb: dto.subtitleCkb ?? "",
    subtitleKmr: dto.subtitleKmr ?? "",
  }
}
