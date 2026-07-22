import { z } from "zod"

import { NS } from "@/components/services/services-strings"
import type {
  ServiceGalleryMediaType,
  ServiceLayoutType,
} from "@/types/services"

const NAV_ANCHOR_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const contentRowSchema = z.object({
  id: z.number().optional(),
  languageCode: z.enum(["CKB", "KMR"]),
  title: z.string().max(300).optional().or(z.literal("")),
  description: z.string().optional(),
})

const optionalUrl = z
  .string()
  .max(1500)
  .optional()
  .or(z.literal(""))
  .refine(
    (v) => !v || v === "" || /^https?:\/\//i.test(v) || v.startsWith("/"),
    { message: NS.validation.urlInvalid },
  )

export const serviceGalleryMediaSchema = z.object({
  clientKey: z.string().optional(),
  type: z.enum(["IMAGE", "VIDEO"]).optional(),
  url: z.string().max(1500),
  posterUrl: optionalUrl,
  alt: z.string().max(500).optional().or(z.literal("")),
})

export const serviceFormSchema = z
  .object({
    serviceType: z.string().max(100).optional().or(z.literal("")),
    location: z.string().max(200).optional().or(z.literal("")),
    layoutType: z
      .enum(["DEFAULT", "FEATURE_GRID", "MEDIA_HERO"])
      .nullable()
      .optional(),
    navAnchorId: z
      .string()
      .max(100)
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || v === "" || NAV_ANCHOR_RE.test(v), {
        message: NS.validation.navAnchorInvalid,
      }),
    sortOrder: z.number().int().min(0).nullable().optional(),
    galleryMedia: z.array(serviceGalleryMediaSchema).default([]),
    partnerIds: z.array(z.number().int().positive()).default([]),
    active: z.boolean().default(true),
    publishedAt: z.string().nullable().optional(),
    contentLanguages: z
      .array(z.enum(["CKB", "KMR"]))
      .min(1, NS.validation.languageRequired),
    contents: z.array(contentRowSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const titledLangs = data.contentLanguages.filter((lang) => {
      const row = data.contents.find((c) => c.languageCode === lang)
      return Boolean(row?.title?.trim())
    })
    if (titledLangs.length === 0) {
      const firstIdx = data.contents.findIndex(
        (c) => c.languageCode === data.contentLanguages[0],
      )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: NS.validation.titleRequired,
        path: ["contents", firstIdx >= 0 ? firstIdx : 0, "title"],
      })
    }
  })

export type ServiceFormValues = z.infer<typeof serviceFormSchema>
export type ServiceGalleryMediaFormValues = z.infer<
  typeof serviceGalleryMediaSchema
>

export function createEmptyGallerySlot(): ServiceGalleryMediaFormValues {
  return {
    clientKey: crypto.randomUUID(),
    type: "IMAGE",
    url: "",
    posterUrl: "",
    alt: "",
  }
}

export function defaultServiceFormValues(): ServiceFormValues {
  return {
    serviceType: "",
    location: "",
    layoutType: "MEDIA_HERO",
    navAnchorId: "",
    sortOrder: null,
    galleryMedia: [],
    partnerIds: [],
    active: true,
    publishedAt: null,
    contentLanguages: ["CKB", "KMR"],
    contents: [
      { languageCode: "CKB", title: "", description: "" },
      { languageCode: "KMR", title: "", description: "" },
    ],
  }
}

function coerceLayoutType(
  raw: string | null | undefined,
): ServiceLayoutType | null {
  if (raw === "DEFAULT" || raw === "FEATURE_GRID" || raw === "MEDIA_HERO") {
    return raw
  }
  return null
}

export function serviceDtoToFormValues(
  dto: import("@/types/services").ServiceDto,
): ServiceFormValues {
  const contentLanguages =
    dto.contentLanguages?.length
      ? dto.contentLanguages
      : dto.contents.map((c) => c.languageCode)

  const contents: ServiceFormValues["contents"] = ["CKB", "KMR"].map(
    (lang) => {
      const hit = dto.contents.find((c) => c.languageCode === lang)
      return {
        id: hit?.id,
        languageCode: lang as "CKB" | "KMR",
        title: hit?.title ?? "",
        description: hit?.description ?? "",
      }
    },
  )

  const galleryMedia: ServiceGalleryMediaFormValues[] = (
    dto.galleryMedia ?? []
  ).map((slot) => ({
    clientKey: crypto.randomUUID(),
    type: slot.type as ServiceGalleryMediaType,
    url: slot.url ?? "",
    posterUrl: slot.posterUrl ?? "",
    alt: slot.alt ?? "",
  }))

  return {
    serviceType: dto.serviceType ?? "",
    location: dto.location ?? "",
    layoutType: coerceLayoutType(dto.layoutType ?? null) ?? "MEDIA_HERO",
    navAnchorId: dto.navAnchorId ?? "",
    sortOrder:
      typeof dto.sortOrder === "number" && Number.isFinite(dto.sortOrder)
        ? dto.sortOrder
        : null,
    galleryMedia,
    partnerIds: [...(dto.partnerIds ?? [])],
    active: dto.active ?? true,
    publishedAt: dto.publishedAt ?? null,
    contentLanguages:
      contentLanguages.length > 0 ? contentLanguages : ["CKB", "KMR"],
    contents,
  }
}
