import { z } from "zod"

const NEWS_MEDIA_TYPE_VALUES = [
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "DOCUMENT",
  "OTHER",
] as const

export const newsFormSchema = z
  .object({
    contentLanguages: z.array(z.enum(["CKB", "KMR"])).min(1),
    category: z.object({
      ckbName: z.string().min(1),
      kmrName: z.string().min(1),
    }),
    subCategory: z.object({
      ckbName: z.string().min(1),
      kmrName: z.string().min(1),
    }),
    coverFile: z.instanceof(File).optional(),
    coverUrl: z.string().optional(),
    datePublished: z.string().optional(),
    ckbContent: z
      .object({
        title: z.string(),
        description: z.string().optional(),
      })
      .optional(),
    kmrContent: z
      .object({
        title: z.string(),
        description: z.string().optional(),
      })
      .optional(),
    tags: z
      .object({
        ckb: z.array(z.string()),
        kmr: z.array(z.string()),
      })
      .optional(),
    keywords: z
      .object({
        ckb: z.array(z.string()),
        kmr: z.array(z.string()),
      })
      .optional(),
    media: z
      .array(
        z.object({
          type: z.enum(NEWS_MEDIA_TYPE_VALUES),
          url: z.string().optional(),
          externalUrl: z.string().optional(),
          embedUrl: z.string().optional(),
          sortOrder: z.number().optional(),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.contentLanguages.includes("CKB")) {
      const title = data.ckbContent?.title?.trim() ?? ""
      if (!title) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ناونیشانی کوردی سۆرانی پێویستە",
          path: ["ckbContent", "title"],
        })
      }
    }
    if (data.contentLanguages.includes("KMR")) {
      const title = data.kmrContent?.title?.trim() ?? ""
      if (!title) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ناونیشانی کوردی کرمانجی پێویستە",
          path: ["kmrContent", "title"],
        })
      }
    }
  })

export type NewsFormValues = z.infer<typeof newsFormSchema>
