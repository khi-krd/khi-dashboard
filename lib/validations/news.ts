import { z } from "zod"

import { NS } from "@/components/news/news-strings"
import { isRichTextEmpty } from "@/lib/rich-text-empty"
import { mediaGalleryFieldSchema } from "@/lib/validations/media-gallery"

export const newsFormSchema = z
  .object({
    contentLanguages: z
      .array(z.enum(["CKB", "KMR"]))
      .min(1, NS.validation.languageRequired),
    category: z.object({
      ckbName: z.string().min(1),
      kmrName: z.string().min(1),
    }),
    subCategory: z.object({
      ckbName: z.string().min(1),
      kmrName: z.string().min(1),
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
    const hasCover =
      !!(data.coverUrl && data.coverUrl.trim()) ||
      !!(data.existingCoverUrl && data.existingCoverUrl.trim())

    if (!hasCover) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "وێنەی ڕووکار پێویستە",
        path: ["coverUrl"],
      })
    }

    if (data.contentLanguages.includes("CKB")) {
      const title = data.ckbContent?.title?.trim() ?? ""
      if (!title) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ناونیشانی سۆرانی پێویستە",
          path: ["ckbContent", "title"],
        })
      } else if (title.length > 250) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ناونیشان دەبێت ٢٥٠ پیت یان کەمتر بێت",
          path: ["ckbContent", "title"],
        })
      }

      const desc = data.ckbContent?.description
      if (isRichTextEmpty(desc)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "وەسفی سۆرانی پێویستە",
          path: ["ckbContent", "description"],
        })
      }
    }

    if (data.contentLanguages.includes("KMR")) {
      const title = data.kmrContent?.title?.trim() ?? ""
      if (!title) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ناونیشانی کرمانجی پێویستە",
          path: ["kmrContent", "title"],
        })
      } else if (title.length > 250) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ناونیشان دەبێت ٢٥٠ پیت یان کەمتر بێت",
          path: ["kmrContent", "title"],
        })
      }

      const desc = data.kmrContent?.description
      if (isRichTextEmpty(desc)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "وەسفی کرمانجی پێویستە",
          path: ["kmrContent", "description"],
        })
      }
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
