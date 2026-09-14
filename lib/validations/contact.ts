import { z } from "zod"

import { NS } from "@/components/contact/contact-strings"

// slugCkb, phone and email are @NotBlank on the API (`email` is @Email too) —
// optional here only ever produced a generic 400 toast. Everything else stays
// optional: an office can be saved with any subset filled in.
export const contactFormSchema = z
  .object({
    active: z.boolean().default(true),
    slugCkb: z.string().trim().min(1, NS.validation.slugCkbRequired).max(200),
    slugKmr: z.string().max(200).optional().nullable(),
    displayOrder: z.number().int().nullable().optional(),
    contentLanguages: z.array(z.enum(["CKB", "KMR"])).min(1),
    titleCkb: z.string().max(300).optional().nullable(),
    titleKmr: z.string().max(300).optional().nullable(),
    subtitleCkb: z.string().max(500).optional().nullable(),
    subtitleKmr: z.string().max(500).optional().nullable(),
    addressCkb: z.string().max(500).optional().nullable(),
    addressKmr: z.string().max(500).optional().nullable(),
    workingHoursCkb: z.string().max(300).optional().nullable(),
    workingHoursKmr: z.string().max(300).optional().nullable(),
    descriptionCkb: z.string().optional().nullable(),
    descriptionKmr: z.string().optional().nullable(),
    phone: z.string().trim().min(1, NS.validation.phoneRequired).max(60),
    secondaryPhone: z.string().max(60).optional().nullable(),
    email: z
      .string()
      .trim()
      .min(1, NS.validation.emailRequired)
      .max(200)
      .email(NS.validation.emailInvalid),
    mapEmbedUrl: z.string().optional().nullable(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    heroImageUrl: z.string().optional().nullable(),
    officeType: z.string().max(40).optional().nullable(),
    badgeCkb: z.string().max(200).optional().nullable(),
    badgeKmr: z.string().max(200).optional().nullable(),
  })
  .superRefine((values, ctx) => {
    // The API rejects slugCkb == slugKmr with a bare 400 — catch it inline.
    const kmr = values.slugKmr?.trim()
    if (kmr && kmr === values.slugCkb.trim()) {
      ctx.addIssue({
        code: "custom",
        message: NS.validation.slugsMustDiffer,
        path: ["slugKmr"],
      })
    }
  })

export type ContactFormValues = z.infer<typeof contactFormSchema>

export const defaultContactFormValues: ContactFormValues = {
  active: true,
  slugCkb: "",
  slugKmr: "",
  displayOrder: null,
  contentLanguages: ["CKB"],
  titleCkb: "",
  titleKmr: "",
  subtitleCkb: "",
  subtitleKmr: "",
  addressCkb: "",
  addressKmr: "",
  workingHoursCkb: "",
  workingHoursKmr: "",
  descriptionCkb: "",
  descriptionKmr: "",
  phone: "",
  secondaryPhone: "",
  email: "",
  mapEmbedUrl: "",
  latitude: null,
  longitude: null,
  heroImageUrl: "",
  officeType: "",
  badgeCkb: "",
  badgeKmr: "",
}

export type ContactCompletionInput = {
  titleCkb?: string | null
  titleKmr?: string | null
  addressCkb?: string | null
  addressKmr?: string | null
  workingHoursCkb?: string | null
  workingHoursKmr?: string | null
  descriptionCkb?: string | null
  descriptionKmr?: string | null
}

export function computeContactCompletion(
  values: ContactCompletionInput,
  lang: "CKB" | "KMR",
): number {
  let score = 0
  const title = lang === "CKB" ? values.titleCkb : values.titleKmr
  const address = lang === "CKB" ? values.addressCkb : values.addressKmr
  const hours = lang === "CKB" ? values.workingHoursCkb : values.workingHoursKmr
  const desc = lang === "CKB" ? values.descriptionCkb : values.descriptionKmr
  if (title?.trim()) score += 1
  if (address?.trim()) score += 1
  if (hours?.trim()) score += 1
  if (desc?.trim()) score += 1
  return score
}

export function contactDtoToFormValues(
  dto: import("@/types/contact").ContactDto,
): ContactFormValues {
  const langs: ("CKB" | "KMR")[] = []
  if (dto.ckbContent) langs.push("CKB")
  if (dto.kmrContent) langs.push("KMR")

  return {
    active: dto.active ?? true,
    slugCkb: dto.slugCkb ?? "",
    slugKmr: dto.slugKmr ?? "",
    displayOrder: dto.displayOrder ?? null,
    contentLanguages: langs.length ? langs : ["CKB"],
    titleCkb: dto.ckbContent?.title ?? "",
    titleKmr: dto.kmrContent?.title ?? "",
    subtitleCkb: dto.ckbContent?.subtitle ?? "",
    subtitleKmr: dto.kmrContent?.subtitle ?? "",
    addressCkb: dto.ckbContent?.address ?? "",
    addressKmr: dto.kmrContent?.address ?? "",
    workingHoursCkb: dto.ckbContent?.workingHours ?? "",
    workingHoursKmr: dto.kmrContent?.workingHours ?? "",
    descriptionCkb: dto.ckbContent?.description ?? "",
    descriptionKmr: dto.kmrContent?.description ?? "",
    phone: dto.phone ?? "",
    secondaryPhone: dto.secondaryPhone ?? "",
    email: dto.email ?? "",
    mapEmbedUrl: dto.mapEmbedUrl ?? "",
    latitude: dto.latitude ?? null,
    longitude: dto.longitude ?? null,
    heroImageUrl: dto.heroImageUrl ?? "",
    officeType: dto.officeType ?? "",
    badgeCkb: dto.badgeCkb ?? "",
    badgeKmr: dto.badgeKmr ?? "",
  }
}
