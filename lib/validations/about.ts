import { z } from "zod"

import { NS } from "@/components/about/about-strings"
import { isRichTextEmpty } from "@/lib/sanitize-news-html"
import type { AboutDto } from "@/types/about"

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
