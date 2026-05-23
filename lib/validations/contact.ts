import { z } from "zod"

export const contactFormSchema = z.object({
  active: z.boolean().default(true),
  slugCkb: z.string().min(1).max(200),
  slugKmr: z.string().max(200).optional().nullable(),
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
  phone: z.string().max(60).optional().nullable(),
  secondaryPhone: z.string().max(60).optional().nullable(),
  email: z.string().email().max(200).optional().or(z.literal("")),
  mapEmbedUrl: z.string().optional().nullable(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

export const defaultContactFormValues: ContactFormValues = {
  active: true,
  slugCkb: "",
  slugKmr: "",
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
  }
}
