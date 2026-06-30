import { z } from "zod"

import { NS } from "@/components/about/about-strings"
import { isRichTextEmpty } from "@/lib/rich-text-empty"
import type { AboutDto } from "@/types/about"

export const aboutStatSchema = z.object({
  labelCkb: z.string().max(200).optional().nullable(),
  labelKmr: z.string().max(200).optional().nullable(),
  value: z.string().max(100).optional().nullable(),
})

export const aboutFormSchema = z
  .object({
    active: z.boolean().default(true),
    slugCkb: z.string().max(200),
    slugKmr: z.string().max(200).optional().nullable(),
    titleCkb: z.string().max(300).optional().nullable(),
    titleKmr: z.string().max(300).optional().nullable(),
    subtitleCkb: z.string().max(500).optional().nullable(),
    subtitleKmr: z.string().max(500).optional().nullable(),
    seoDescriptionCkb: z.string().max(2500).optional().nullable(),
    seoDescriptionKmr: z.string().max(2500).optional().nullable(),
    bodyCkb: z.string().optional().nullable(),
    bodyKmr: z.string().optional().nullable(),
    founderNameCkb: z.string().max(300).optional().nullable(),
    founderNameKmr: z.string().max(300).optional().nullable(),
    founderBioCkb: z.string().max(5000).optional().nullable(),
    founderBioKmr: z.string().max(5000).optional().nullable(),
    founderImageUrl: z.string().url().max(1500).optional().nullable().or(z.literal("")),
    heroVideoUrl: z.string().url().max(1500).optional().nullable().or(z.literal("")),
    heroPosterUrl: z.string().url().max(1500).optional().nullable().or(z.literal("")),
    stats: z.array(aboutStatSchema).default([]),
    contentLanguages: z
      .array(z.enum(["CKB", "KMR"]))
      .min(1, NS.validation.languageRequired),
  })
  .superRefine((val, ctx) => {
    if (val.contentLanguages.includes("CKB") && !val.slugCkb?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: NS.validation.slugCkbRequired,
        path: ["slugCkb"],
      })
    }
    if (val.contentLanguages.includes("CKB") && !val.titleCkb?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: NS.validation.titleCkbRequired,
        path: ["titleCkb"],
      })
    }
    if (val.contentLanguages.includes("KMR") && !val.titleKmr?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: NS.validation.titleKmrRequired,
        path: ["titleKmr"],
      })
    }
  })

export type AboutFormValues = z.infer<typeof aboutFormSchema>

export const defaultAboutFormValues: AboutFormValues = {
  active: true,
  slugCkb: "",
  slugKmr: "",
  titleCkb: "",
  titleKmr: "",
  subtitleCkb: "",
  subtitleKmr: "",
  seoDescriptionCkb: "",
  seoDescriptionKmr: "",
  bodyCkb: "",
  bodyKmr: "",
  founderNameCkb: "",
  founderNameKmr: "",
  founderBioCkb: "",
  founderBioKmr: "",
  founderImageUrl: "",
  heroVideoUrl: "",
  heroPosterUrl: "",
  stats: [],
  contentLanguages: ["CKB"],
}

export function aboutDtoToFormValues(dto: AboutDto): AboutFormValues {
  const contentLanguages: ("CKB" | "KMR")[] = []
  if (dto.ckbContent) contentLanguages.push("CKB")
  if (dto.kmrContent) contentLanguages.push("KMR")

  return {
    active: dto.active ?? true,
    slugCkb: dto.slugCkb ?? "",
    slugKmr: dto.slugKmr ?? "",
    titleCkb: dto.ckbContent?.title ?? "",
    titleKmr: dto.kmrContent?.title ?? "",
    subtitleCkb: dto.ckbContent?.subtitle ?? "",
    subtitleKmr: dto.kmrContent?.subtitle ?? "",
    seoDescriptionCkb: dto.ckbContent?.metaDescription ?? "",
    seoDescriptionKmr: dto.kmrContent?.metaDescription ?? "",
    bodyCkb: dto.ckbContent?.body ?? "",
    bodyKmr: dto.kmrContent?.body ?? "",
    founderNameCkb: dto.founderNameCkb ?? "",
    founderNameKmr: dto.founderNameKmr ?? "",
    founderBioCkb: dto.founderBioCkb ?? "",
    founderBioKmr: dto.founderBioKmr ?? "",
    founderImageUrl: dto.founderImageUrl ?? "",
    heroVideoUrl: dto.heroVideoUrl ?? "",
    heroPosterUrl: dto.heroPosterUrl ?? "",
    stats: (dto.stats ?? []).map((s) => ({
      labelCkb: s.labelCkb ?? "",
      labelKmr: s.labelKmr ?? "",
      value: s.value ?? "",
    })),
    contentLanguages: contentLanguages.length ? contentLanguages : ["CKB"],
  }
}

export type AboutCompletionInput = {
  titleCkb?: string | null
  titleKmr?: string | null
  subtitleCkb?: string | null
  subtitleKmr?: string | null
  seoDescriptionCkb?: string | null
  seoDescriptionKmr?: string | null
  bodyCkb?: string | null
  bodyKmr?: string | null
}

export function computeAboutCompletion(
  values: AboutCompletionInput,
  lang: "CKB" | "KMR",
): number {
  let score = 0
  const title = lang === "CKB" ? values.titleCkb : values.titleKmr
  const subtitle = lang === "CKB" ? values.subtitleCkb : values.subtitleKmr
  const seo = lang === "CKB" ? values.seoDescriptionCkb : values.seoDescriptionKmr
  const body = lang === "CKB" ? values.bodyCkb : values.bodyKmr
  if (title?.trim()) score += 1
  if (subtitle?.trim()) score += 1
  if (seo?.trim()) score += 1
  if (!isRichTextEmpty(body)) score += 1
  return score
}
