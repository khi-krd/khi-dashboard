import { z } from "zod"

import { NS } from "@/components/projects/projects-strings"

const PROJECT_MEDIA_TYPES = [
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "PDF",
  "DOCUMENT",
] as const

const mediaItemSchema = z.object({
  mediaType: z.enum(PROJECT_MEDIA_TYPES),
  id: z.number().optional(),
  url: z.string().optional().nullable(),
  externalUrl: z.string().optional().nullable(),
  embedUrl: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  stagedFile: z.instanceof(File).optional().nullable(),
})

export const projectFormSchema = z
  .object({
    status: z.enum(["ONGOING", "COMPLETED"]),
    contentLanguages: z
      .array(z.enum(["CKB", "KMR"]))
      .min(1, NS.validation.languageRequired),
    projectTypeCkb: z.string().optional().nullable(),
    projectTypeKmr: z.string().optional().nullable(),
    coverFile: z.instanceof(File).optional().nullable(),
    coverUrl: z.string().optional().nullable(),
    existingCoverUrl: z.string().optional().nullable(),
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
    contents: z.object({
      ckb: z.array(z.string()),
      kmr: z.array(z.string()),
    }),
    tags: z.object({
      ckb: z.array(z.string()),
      kmr: z.array(z.string()),
    }),
    keywords: z.object({
      ckb: z.array(z.string()),
      kmr: z.array(z.string()),
    }),
    mediaItems: z.array(mediaItemSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const hasCover =
      !!data.coverFile ||
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

    data.mediaItems.forEach((m, idx) => {
      const cap = m.caption?.trim() ?? ""
      if (cap.length > 255) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: NS.validation.captionMax,
          path: ["mediaItems", idx, "caption"],
        })
      }

      if (
        m.mediaType === "IMAGE" ||
        m.mediaType === "PDF" ||
        m.mediaType === "DOCUMENT"
      ) {
        const ok = !!(m.stagedFile || (m.url && m.url.trim()))
        if (!ok) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: NS.validation.mediaUrlRequired,
            path: ["mediaItems", idx, "url"],
          })
        }
      }
      if (m.mediaType === "VIDEO" || m.mediaType === "AUDIO") {
        const ok =
          !!m.stagedFile ||
          !!(m.url && m.url.trim()) ||
          !!(m.externalUrl && m.externalUrl.trim()) ||
          !!(m.embedUrl && m.embedUrl.trim())
        if (!ok) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: NS.validation.mediaUrlRequired,
            path: ["mediaItems", idx, "externalUrl"],
          })
        }
      }
    })
  })

export type ProjectFormValues = z.infer<typeof projectFormSchema>

export function defaultProjectFormValues(): ProjectFormValues {
  return {
    status: "ONGOING",
    contentLanguages: ["CKB"],
    projectTypeCkb: "",
    projectTypeKmr: "",
    coverFile: null,
    coverUrl: null,
    existingCoverUrl: null,
    projectDate: undefined,
    ckbContent: { title: "", description: "", location: "" },
    kmrContent: { title: "", description: "", location: "" },
    contents: { ckb: [], kmr: [] },
    tags: { ckb: [], kmr: [] },
    keywords: { ckb: [], kmr: [] },
    mediaItems: [],
  }
}
