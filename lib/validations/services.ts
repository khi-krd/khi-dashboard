import { z } from "zod"

import { NS } from "@/components/services/services-strings"

const fileContentSchema = z.object({
  caption: z.string().max(500).optional(),
  title: z.string().max(300).optional(),
  description: z.string().optional(),
})

const collectionFileSchema = z.object({
  id: z.number().optional(),
  fileUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  ckbContent: fileContentSchema.optional(),
  kmrContent: fileContentSchema.optional(),
  sortOrder: z.number().int().optional(),
  fileFormat: z.string().optional().nullable(),
  widthPx: z.number().optional().nullable(),
  heightPx: z.number().optional().nullable(),
  resolution: z.string().optional().nullable(),
  durationSeconds: z.number().optional().nullable(),
  formattedDuration: z.string().optional().nullable(),
  codec: z.string().optional().nullable(),
  bitrateKbps: z.number().optional().nullable(),
  fileSize: z.number().optional().nullable(),
  formattedFileSize: z.string().optional().nullable(),
  uploadPending: z.boolean().optional(),
  uploadError: z.string().optional().nullable(),
  stagedFile: z.instanceof(File).optional().nullable(),
})

const mediaCollectionSchema = z.object({
  id: z.number().optional(),
  collectionName: z
    .string()
    .min(1, NS.validation.collectionNameRequired)
    .max(200),
  mediaType: z.enum(["IMAGE", "VIDEO", "AUDIO"]),
  sortOrder: z.number().int().optional(),
  files: z.array(collectionFileSchema).default([]),
})

const contentRowSchema = z.object({
  languageCode: z.enum(["CKB", "KMR"]),
  title: z.string().min(1, NS.validation.titleRequired).max(300),
  description: z.string().optional(),
})

export const serviceFormSchema = z
  .object({
    serviceType: z
      .string()
      .min(1, NS.field.typeRequired)
      .max(100),
    location: z.string().max(200).optional().or(z.literal("")),
    coverMediaUrl: z.string().url().optional().or(z.literal("")),
    coverFile: z.instanceof(File).optional().nullable(),
    existingCoverMediaUrl: z.string().optional().nullable(),
    active: z.boolean().default(true),
    publishedAt: z.string().nullable().optional(),
    contentLanguages: z
      .array(z.enum(["CKB", "KMR"]))
      .min(1, NS.validation.languageRequired),
    contents: z.array(contentRowSchema).min(1),
    mediaCollections: z.array(mediaCollectionSchema).default([]),
  })
  .superRefine((data, ctx) => {
    for (const lang of data.contentLanguages) {
      const row = data.contents.find((c) => c.languageCode === lang)
      if (!row?.title?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: NS.validation.titleRequired,
          path: [
            "contents",
            data.contents.findIndex((c) => c.languageCode === lang),
            "title",
          ],
        })
      }
    }
  })

export type ServiceFormValues = z.infer<typeof serviceFormSchema>

export function defaultServiceFormValues(): ServiceFormValues {
  return {
    serviceType: "",
    location: "",
    coverMediaUrl: "",
    coverFile: null,
    existingCoverMediaUrl: null,
    active: true,
    publishedAt: null,
    contentLanguages: ["CKB"],
    contents: [
      { languageCode: "CKB", title: "", description: "" },
      { languageCode: "KMR", title: "", description: "" },
    ],
    mediaCollections: [],
  }
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
        languageCode: lang as "CKB" | "KMR",
        title: hit?.title ?? "",
        description: hit?.description ?? "",
      }
    },
  )

  return {
    serviceType: dto.serviceType ?? "",
    location: dto.location ?? "",
    coverMediaUrl: dto.coverMediaUrl ?? "",
    coverFile: null,
    existingCoverMediaUrl: dto.coverMediaUrl ?? null,
    active: dto.active ?? true,
    publishedAt: dto.publishedAt ?? null,
    contentLanguages,
    contents,
    mediaCollections: (dto.mediaCollections ?? []).map((col, i) => ({
      id: col.id,
      collectionName: col.collectionName,
      mediaType: col.mediaType,
      sortOrder: col.sortOrder ?? i,
      files: (col.files ?? []).map((f, fi) => ({
        id: f.id,
        fileUrl: f.fileUrl,
        thumbnailUrl: f.thumbnailUrl ?? "",
        ckbContent: f.ckbContent
          ? {
              caption: f.ckbContent.caption ?? undefined,
              title: f.ckbContent.title ?? undefined,
              description: f.ckbContent.description ?? undefined,
            }
          : undefined,
        kmrContent: f.kmrContent
          ? {
              caption: f.kmrContent.caption ?? undefined,
              title: f.kmrContent.title ?? undefined,
              description: f.kmrContent.description ?? undefined,
            }
          : undefined,
        sortOrder: f.sortOrder ?? fi,
        fileFormat: f.fileFormat,
        widthPx: f.widthPx,
        heightPx: f.heightPx,
        resolution: f.resolution,
        durationSeconds: f.durationSeconds,
        formattedDuration: f.formattedDuration,
        codec: f.codec,
        bitrateKbps: f.bitrateKbps,
        fileSize: f.fileSize,
        formattedFileSize: f.formattedFileSize,
      })),
    })),
  }
}
