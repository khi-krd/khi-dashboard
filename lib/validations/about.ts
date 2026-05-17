import { z } from "zod"

import { NS } from "@/components/about/about-strings"
import { ABOUT_BLOCK_TYPES } from "@/types/about"
import type { AboutBlockDto, AboutDto } from "@/types/about"

const blockTypeEnum = z.enum(ABOUT_BLOCK_TYPES)

const AboutBlockSchema = z.object({
  id: z.union([z.number(), z.string()]),
  type: blockTypeEnum,
  sortOrder: z.number().optional(),
  contentLanguages: z.array(z.enum(["CKB", "KMR"])).optional(),
  headingCkb: z.string().max(300).optional().nullable(),
  headingKmr: z.string().max(300).optional().nullable(),
  bodyCkb: z.string().optional().nullable(),
  bodyKmr: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  captionCkb: z.string().max(500).optional().nullable(),
  captionKmr: z.string().max(500).optional().nullable(),
  alignment: z.enum(["center", "wide", "full"]).optional().nullable(),
  embedUrl: z.string().optional().nullable(),
  audioUrl: z.string().optional().nullable(),
  titleCkb: z.string().max(300).optional().nullable(),
  titleKmr: z.string().max(300).optional().nullable(),
  durationSeconds: z.number().min(0).optional().nullable(),
  images: z
    .array(
      z.object({
        id: z.number().optional(),
        imageUrl: z.string().optional().nullable(),
        sortOrder: z.number().optional(),
        imageFile: z.instanceof(File).optional().nullable(),
      }),
    )
    .optional(),
  textCkb: z.string().max(2000).optional().nullable(),
  textKmr: z.string().max(2000).optional().nullable(),
  attributionCkb: z.string().max(300).optional().nullable(),
  attributionKmr: z.string().max(300).optional().nullable(),
  value: z.string().max(50).optional().nullable(),
  unitCkb: z.string().max(80).optional().nullable(),
  unitKmr: z.string().max(80).optional().nullable(),
  labelCkb: z.string().max(200).optional().nullable(),
  labelKmr: z.string().max(200).optional().nullable(),
  imageFile: z.instanceof(File).optional().nullable(),
})

export const aboutFormSchema = z
  .object({
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    slugCkb: z.string().max(120),
    slugKmr: z.string().max(120).optional().nullable(),
    titleCkb: z.string().max(200).optional().nullable(),
    titleKmr: z.string().max(200).optional().nullable(),
    subtitleCkb: z.string().max(300).optional().nullable(),
    subtitleKmr: z.string().max(300).optional().nullable(),
    seoDescriptionCkb: z.string().max(160).optional().nullable(),
    seoDescriptionKmr: z.string().max(160).optional().nullable(),
    heroImageUrl: z.string().optional().nullable(),
    heroImageFile: z.instanceof(File).optional().nullable(),
    existingHeroImageUrl: z.string().optional().nullable(),
    contentLanguages: z
      .array(z.enum(["CKB", "KMR"]))
      .min(1, NS.validation.languageRequired),
    blocks: z.array(AboutBlockSchema).default([]),
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
    if (val.blocks.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: NS.validation.blocksRequired,
        path: ["blocks"],
      })
    }
  })

export type AboutFormValues = z.infer<typeof aboutFormSchema>

export const defaultAboutFormValues: AboutFormValues = {
  status: "DRAFT",
  slugCkb: "",
  slugKmr: "",
  titleCkb: "",
  titleKmr: "",
  subtitleCkb: "",
  subtitleKmr: "",
  seoDescriptionCkb: "",
  seoDescriptionKmr: "",
  heroImageUrl: "",
  heroImageFile: null,
  existingHeroImageUrl: null,
  contentLanguages: ["CKB"],
  blocks: [],
}

export function createEmptyBlock(
  type: AboutFormValues["blocks"][number]["type"],
  index: number,
): AboutFormValues["blocks"][number] {
  return {
    id: `new-${Date.now()}-${index}`,
    type,
    sortOrder: index,
    contentLanguages: ["CKB"],
    headingCkb: "",
    headingKmr: "",
    bodyCkb: "",
    bodyKmr: "",
    imageUrl: "",
    captionCkb: "",
    captionKmr: "",
    alignment: "center",
    embedUrl: "",
    audioUrl: "",
    titleCkb: "",
    titleKmr: "",
    durationSeconds: null,
    images: [],
    textCkb: "",
    textKmr: "",
    attributionCkb: "",
    attributionKmr: "",
    value: "",
    unitCkb: "",
    unitKmr: "",
    labelCkb: "",
    labelKmr: "",
    imageFile: null,
  }
}

export function aboutDtoToFormValues(dto: AboutDto): AboutFormValues {
  return {
    status: dto.status ?? "DRAFT",
    slugCkb: dto.slugCkb ?? "",
    slugKmr: dto.slugKmr ?? "",
    titleCkb: dto.titleCkb ?? "",
    titleKmr: dto.titleKmr ?? "",
    subtitleCkb: dto.subtitleCkb ?? "",
    subtitleKmr: dto.subtitleKmr ?? "",
    seoDescriptionCkb: dto.seoDescriptionCkb ?? "",
    seoDescriptionKmr: dto.seoDescriptionKmr ?? "",
    heroImageUrl: dto.heroImageUrl ?? "",
    heroImageFile: null,
    existingHeroImageUrl: dto.heroImageUrl ?? null,
    contentLanguages: dto.contentLanguages?.length
      ? dto.contentLanguages
      : ["CKB"],
    blocks: (dto.blocks ?? []).map((b, i) => ({
      id: b.id ?? `block-${i}`,
      type: b.type,
      sortOrder: b.sortOrder ?? i,
      contentLanguages: b.contentLanguages ?? ["CKB"],
      headingCkb: b.headingCkb ?? "",
      headingKmr: b.headingKmr ?? "",
      bodyCkb: b.bodyCkb ?? "",
      bodyKmr: b.bodyKmr ?? "",
      imageUrl: b.imageUrl ?? "",
      captionCkb: b.captionCkb ?? "",
      captionKmr: b.captionKmr ?? "",
      alignment: b.alignment ?? "center",
      embedUrl: b.embedUrl ?? "",
      audioUrl: b.audioUrl ?? "",
      titleCkb: b.titleCkb ?? "",
      titleKmr: b.titleKmr ?? "",
      durationSeconds: b.durationSeconds ?? null,
      images: (b.images ?? []).map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl ?? "",
        sortOrder: img.sortOrder,
      })),
      textCkb: b.textCkb ?? "",
      textKmr: b.textKmr ?? "",
      attributionCkb: b.attributionCkb ?? "",
      attributionKmr: b.attributionKmr ?? "",
      value: b.value ?? "",
      unitCkb: b.unitCkb ?? "",
      unitKmr: b.unitKmr ?? "",
      labelCkb: b.labelCkb ?? "",
      labelKmr: b.labelKmr ?? "",
      imageFile: null,
    })),
  }
}

export type AboutCompletionInput = {
  titleCkb?: string | null
  titleKmr?: string | null
  subtitleCkb?: string | null
  subtitleKmr?: string | null
  seoDescriptionCkb?: string | null
  seoDescriptionKmr?: string | null
  blocks: Array<{
    type: string
    bodyCkb?: string | null
    bodyKmr?: string | null
    headingCkb?: string | null
    headingKmr?: string | null
  }>
}

export function computeAboutCompletion(
  values: AboutCompletionInput,
  lang: "CKB" | "KMR",
): number {
  let score = 0
  const title = lang === "CKB" ? values.titleCkb : values.titleKmr
  const subtitle = lang === "CKB" ? values.subtitleCkb : values.subtitleKmr
  const seo = lang === "CKB" ? values.seoDescriptionCkb : values.seoDescriptionKmr
  if (title?.trim()) score += 1
  if (subtitle?.trim()) score += 1
  if (seo?.trim()) score += 1
  const hasBlock = values.blocks.some((b) => {
    if (b.type === "TEXT") {
      return lang === "CKB"
        ? !!(b.bodyCkb?.trim() || b.headingCkb?.trim())
        : !!(b.bodyKmr?.trim() || b.headingKmr?.trim())
    }
    return true
  })
  if (hasBlock) score += 1
  return score
}

export function blockCountsByType(blocks: AboutBlockDto[] | AboutFormValues["blocks"]) {
  const counts: Record<string, number> = {}
  for (const b of blocks) {
    counts[b.type] = (counts[b.type] ?? 0) + 1
  }
  return counts
}
