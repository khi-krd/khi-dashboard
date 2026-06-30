import { z } from "zod"

import { NS } from "@/components/projects/projects-strings"

import { mediaGalleryFieldSchema } from "@/lib/validations/media-gallery"

export const projectFormSchema = z
  .object({
    status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]),
    contentLanguages: z
      .array(z.enum(["CKB", "KMR"]))
      .min(1, NS.validation.languageRequired),
    projectTypeCkb: z.string().optional().nullable(),
    projectTypeKmr: z.string().optional().nullable(),
    coverUrl: z.string().optional().nullable(),
    existingCoverUrl: z.string().optional().nullable(),
    coverMediaType: z.enum(["IMAGE", "VIDEO", "AUDIO"]).default("IMAGE"),
    coverThumbnailUrl: z.string().optional().nullable(),
    existingCoverThumbnailUrl: z.string().optional().nullable(),
    mediaGallery: mediaGalleryFieldSchema,
    projectDate: z.string().optional().nullable(),
    ckbContent: z
      .object({
        title: z.string(),
        description: z.string().optional().nullable(),
        location: z.string().optional().nullable(),
      })
      .optional(),
    kmrContent: z
      .object({
        title: z.string(),
        description: z.string().optional().nullable(),
        location: z.string().optional().nullable(),
      })
      .optional(),
    tags: z.object({
      ckb: z.array(z.string()),
      kmr: z.array(z.string()),
    }),
    keywords: z.object({
      ckb: z.array(z.string()),
      kmr: z.array(z.string()),
    }),
  })
  .superRefine((data, ctx) => {
    const hasCover =
      !!(data.coverUrl && data.coverUrl.trim()) ||
      !!(data.existingCoverUrl && data.existingCoverUrl.trim())

    if (!hasCover) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: NS.validation.coverRequired,
        path: ["coverUrl"],
      })
    }

    const typeCkb = data.projectTypeCkb?.trim() ?? ""
    const typeKmr = data.projectTypeKmr?.trim() ?? ""
    if ((typeCkb && !typeKmr) || (!typeCkb && typeKmr)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: NS.validation.typeBothLanguages,
        path: ["projectTypeKmr"],
      })
    }

    if (data.contentLanguages.includes("CKB")) {
      const title = data.ckbContent?.title?.trim() ?? ""
      if (!title) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: NS.validation.titleCkbRequired,
          path: ["ckbContent", "title"],
        })
      } else if (title.length > 255) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: NS.validation.titleMax,
          path: ["ckbContent", "title"],
        })
      }
      const loc = data.ckbContent?.location?.trim() ?? ""
      if (loc.length > 255) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: NS.validation.locationMax,
          path: ["ckbContent", "location"],
        })
      }
    }

    if (data.contentLanguages.includes("KMR")) {
      const title = data.kmrContent?.title?.trim() ?? ""
      if (!title) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: NS.validation.titleKmrRequired,
          path: ["kmrContent", "title"],
        })
      } else if (title.length > 255) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: NS.validation.titleMax,
          path: ["kmrContent", "title"],
        })
      }
      const loc = data.kmrContent?.location?.trim() ?? ""
      if (loc.length > 255) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: NS.validation.locationMax,
          path: ["kmrContent", "location"],
        })
      }
    }
  })

export type ProjectFormValues = z.infer<typeof projectFormSchema>

export function defaultProjectFormValues(): ProjectFormValues {
  return {
    status: "ACTIVE",
    contentLanguages: ["CKB"],
    projectTypeCkb: "",
    projectTypeKmr: "",
    coverUrl: null,
    existingCoverUrl: null,
    coverMediaType: "IMAGE",
    coverThumbnailUrl: null,
    existingCoverThumbnailUrl: null,
    mediaGallery: [],
    projectDate: undefined,
    ckbContent: { title: "", description: "", location: "" },
    kmrContent: { title: "", description: "", location: "" },
    tags: { ckb: [], kmr: [] },
    keywords: { ckb: [], kmr: [] },
  }
}
