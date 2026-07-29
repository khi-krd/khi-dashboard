import { z } from "zod"

import { NS } from "@/components/about/about-strings"
import type { AboutDto } from "@/types/about"

export const aboutPageHeroSchema = z.object({
  heroPosterUrl: z.string().max(1500).optional().or(z.literal("")),
  heroVideoUrl: z.string().max(1500).optional().or(z.literal("")),
  titleCkb: z.string().max(300).optional().or(z.literal("")),
  titleKmr: z.string().max(300).optional().or(z.literal("")),
  subtitleCkb: z.string().max(500).optional().or(z.literal("")),
  subtitleKmr: z.string().max(500).optional().or(z.literal("")),
})

export type AboutPageHeroFormValues = z.infer<typeof aboutPageHeroSchema>

export function defaultAboutPageHeroValues(): AboutPageHeroFormValues {
  return {
    heroPosterUrl: "",
    heroVideoUrl: "",
    titleCkb: "",
    titleKmr: "",
    subtitleCkb: "",
    subtitleKmr: "",
  }
}

export function aboutDtoToHeroFormValues(dto: AboutDto): AboutPageHeroFormValues {
  return {
    heroPosterUrl: dto.heroPosterUrl ?? "",
    heroVideoUrl: dto.heroVideoUrl ?? "",
    titleCkb: dto.ckbContent?.title ?? "",
    titleKmr: dto.kmrContent?.title ?? "",
    subtitleCkb: dto.ckbContent?.subtitle ?? "",
    subtitleKmr: dto.kmrContent?.subtitle ?? "",
  }
}

export function heroFormIsValid(values: AboutPageHeroFormValues): boolean {
  return Boolean(values.titleCkb?.trim() || values.titleKmr?.trim())
}

export const heroValidationMessage = NS.validation.titleCkbRequired
