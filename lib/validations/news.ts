import { z } from "zod"

import { NS } from "@/components/news/news-strings"
import { mediaGalleryFieldSchema } from "@/lib/validations/media-gallery"

// Every field is optional by design: an editor can save a draft with any
// subset filled in. Only format/length rules remain — they fire on what was
// typed, never on what was left blank.
export const newsFormSchema = z
  .object({
    contentLanguages: z
      .array(z.enum(["CKB", "KMR"]))
      .min(1, NS.validation.languageRequired),
    category: z.object({
      ckbName: z.string(),
      kmrName: z.string(),
    }),
    subCategory: z.object({
      ckbName: z.string(),
      kmrName: z.string(),
    }),
    coverUrl: z.string().optional().nullable(),
    existingCoverUrl: z.string().optional().nullable(),
    coverMediaType: z.enum(["IMAGE", "VIDEO", "AUDIO"]).default("IMAGE"),
    coverThumbnailUrl: z.string().optional().nullable(),
    existingCoverThumbnailUrl: z.string().optional().nullable(),
    mediaGallery: mediaGalleryFieldSchema,
    datePublished: z.string().optional().nullable(),
    ckbContent: z
      .object({
        title: z.string(),
        description: z.string().optional().nullable(),
      })
      .optional(),
    kmrContent: z
      .object({
        title: z.string(),
        description: z.string().optional().nullable(),
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
    const ckbTitle = data.ckbContent?.title?.trim() ?? ""
    if (data.contentLanguages.includes("CKB") && ckbTitle.length > 250) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ناونیشان دەبێت ٢٥٠ پیت یان کەمتر بێت",
        path: ["ckbContent", "title"],
      })
    }

    const kmrTitle = data.kmrContent?.title?.trim() ?? ""
    if (data.contentLanguages.includes("KMR") && kmrTitle.length > 250) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ناونیشان دەبێت ٢٥٠ پیت یان کەمتر بێت",
        path: ["kmrContent", "title"],
      })
    }
  })

export type NewsFormValues = z.infer<typeof newsFormSchema>

export function defaultNewsFormValues(): NewsFormValues {
  const today = new Date().toISOString().slice(0, 10)
  return {
    contentLanguages: ["CKB"],
    category: { ckbName: "", kmrName: "" },
    subCategory: { ckbName: "", kmrName: "" },
    coverUrl: null,
    existingCoverUrl: null,
    coverMediaType: "IMAGE",
    coverThumbnailUrl: null,
    existingCoverThumbnailUrl: null,
    mediaGallery: [],
    datePublished: today,
    ckbContent: { title: "", description: "" },
    kmrContent: { title: "", description: "" },
    tags: { ckb: [], kmr: [] },
    keywords: { ckb: [], kmr: [] },
  }
}
