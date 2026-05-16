import { z } from "zod"

import { NS } from "@/components/videos/videos-strings"

const VideoContentSchema = z.object({
  title: z.string().max(300).optional(),
  description: z.string().optional(),
  location: z.string().max(250).optional(),
  director: z.string().max(250).optional(),
  producer: z.string().max(250).optional(),
})

export const VideoClipItemFormSchema = z
  .object({
    id: z.number().optional(),
    url: z.string().optional().or(z.literal("")),
    externalUrl: z.string().optional().or(z.literal("")),
    embedUrl: z.string().optional().or(z.literal("")),
    clipNumber: z.number().int().positive().optional(),
    durationSeconds: z.number().int().min(0).optional().nullable(),
    resolution: z.string().optional().nullable(),
    fileFormat: z.string().optional().nullable(),
    fileSizeMb: z.number().min(0).optional().nullable(),
    titleCkb: z.string().max(300).optional(),
    titleKmr: z.string().max(300).optional(),
    descriptionCkb: z.string().optional(),
    descriptionKmr: z.string().optional(),
    stagedVideoFile: z.instanceof(File).optional().nullable(),
  })
  .refine(
    (clip) =>
      !!(clip.url?.trim() || clip.externalUrl?.trim() || clip.embedUrl?.trim() || clip.stagedVideoFile),
    { message: NS.validation.clipSourceRequired, path: ["url"] },
  )

export const videoFormSchema = z
  .object({
    videoType: z.enum(["FILM", "VIDEO_CLIP"]),
    albumOfMemories: z.boolean().default(false),
    topicId: z.number().int().nullable().optional(),
    newTopic: z
      .object({
        nameCkb: z.string().optional(),
        nameKmr: z.string().optional(),
      })
      .optional()
      .refine((t) => !t || t.nameCkb?.trim() || t.nameKmr?.trim(), {
        message: NS.validation.topicNameRequired,
      }),
    clearTopic: z.boolean().optional(),
    contentLanguages: z
      .array(z.enum(["CKB", "KMR"]))
      .min(1, NS.validation.languageRequired),
    ckbContent: VideoContentSchema.optional(),
    kmrContent: VideoContentSchema.optional(),
    sourceUrl: z.string().optional().or(z.literal("")),
    sourceExternalUrl: z.string().optional().or(z.literal("")),
    sourceEmbedUrl: z.string().optional().or(z.literal("")),
    stagedVideoFile: z.instanceof(File).optional().nullable(),
    videoClipItems: z.array(VideoClipItemFormSchema).default([]),
    fileFormat: z.string().optional().nullable(),
    durationSeconds: z.number().int().min(0).optional().nullable(),
    publishmentDate: z.string().optional().nullable(),
    resolution: z.string().optional().nullable(),
    fileSizeMb: z.number().min(0).optional().nullable(),
    tags: z.object({
      ckb: z.array(z.string().max(100)),
      kmr: z.array(z.string().max(100)),
    }),
    keywords: z.object({
      ckb: z.array(z.string().max(150)),
      kmr: z.array(z.string().max(150)),
    }),
    ckbCoverFile: z.instanceof(File).optional().nullable(),
    kmrCoverFile: z.instanceof(File).optional().nullable(),
    hoverCoverFile: z.instanceof(File).optional().nullable(),
    ckbCoverUrl: z.string().optional().nullable(),
    kmrCoverUrl: z.string().optional().nullable(),
    hoverCoverUrl: z.string().optional().nullable(),
    existingCkbCoverUrl: z.string().optional().nullable(),
    existingKmrCoverUrl: z.string().optional().nullable(),
    existingHoverCoverUrl: z.string().optional().nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.contentLanguages.includes("CKB") && !val.ckbContent?.title?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: NS.validation.titleCkbRequired,
        path: ["ckbContent", "title"],
      })
    }
    if (val.contentLanguages.includes("KMR") && !val.kmrContent?.title?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: NS.validation.titleKmrRequired,
        path: ["kmrContent", "title"],
      })
    }
    if (val.videoType === "FILM") {
      const hasUrl =
        val.sourceUrl?.trim() ||
        val.sourceExternalUrl?.trim() ||
        val.sourceEmbedUrl?.trim()
      if (!hasUrl && !val.stagedVideoFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: NS.validation.sourceRequired,
          path: ["sourceUrl"],
        })
      }
    }
    if (val.videoType === "VIDEO_CLIP" && val.videoClipItems.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: NS.validation.clipsRequired,
        path: ["videoClipItems"],
      })
    }
  })

export type VideoFormValues = z.infer<typeof videoFormSchema>

export const defaultVideoFormValues: VideoFormValues = {
  videoType: "FILM",
  albumOfMemories: false,
  topicId: null,
  newTopic: undefined,
  clearTopic: false,
  contentLanguages: ["CKB"],
  ckbContent: {
    title: "",
    description: "",
    location: "",
    director: "",
    producer: "",
  },
  kmrContent: {
    title: "",
    description: "",
    location: "",
    director: "",
    producer: "",
  },
  sourceUrl: "",
  sourceExternalUrl: "",
  sourceEmbedUrl: "",
  stagedVideoFile: null,
  videoClipItems: [],
  fileFormat: "",
  durationSeconds: null,
  publishmentDate: null,
  resolution: "",
  fileSizeMb: null,
  tags: { ckb: [], kmr: [] },
  keywords: { ckb: [], kmr: [] },
  ckbCoverFile: null,
  kmrCoverFile: null,
  hoverCoverFile: null,
  ckbCoverUrl: "",
  kmrCoverUrl: "",
  hoverCoverUrl: "",
  existingCkbCoverUrl: null,
  existingKmrCoverUrl: null,
  existingHoverCoverUrl: null,
}

export function videoDtoToFormValues(d: import("@/types/videos").VideoDto): VideoFormValues {
  const date =
    typeof d.publishmentDate === "string" && d.publishmentDate.length >= 10
      ? d.publishmentDate.slice(0, 10)
      : null
  return {
    videoType: d.videoType ?? "FILM",
    albumOfMemories: d.albumOfMemories ?? false,
    topicId: d.topicId ?? null,
    clearTopic: false,
    contentLanguages:
      Array.isArray(d.contentLanguages) && d.contentLanguages.length
        ? d.contentLanguages
        : ["CKB"],
    ckbContent: {
      title: d.ckbContent?.title ?? "",
      description: d.ckbContent?.description ?? "",
      location: d.ckbContent?.location ?? "",
      director: d.ckbContent?.director ?? "",
      producer: d.ckbContent?.producer ?? "",
    },
    kmrContent: {
      title: d.kmrContent?.title ?? "",
      description: d.kmrContent?.description ?? "",
      location: d.kmrContent?.location ?? "",
      director: d.kmrContent?.director ?? "",
      producer: d.kmrContent?.producer ?? "",
    },
    sourceUrl: d.sourceUrl ?? "",
    sourceExternalUrl: d.sourceExternalUrl ?? "",
    sourceEmbedUrl: d.sourceEmbedUrl ?? "",
    stagedVideoFile: null,
    videoClipItems: (d.videoClipItems ?? []).map((c, i) => ({
      id: c.id,
      url: c.url ?? "",
      externalUrl: c.externalUrl ?? "",
      embedUrl: c.embedUrl ?? "",
      clipNumber: c.clipNumber ?? i + 1,
      durationSeconds: c.durationSeconds ?? null,
      resolution: c.resolution ?? "",
      fileFormat: c.fileFormat ?? "",
      fileSizeMb: c.fileSizeMb ?? null,
      titleCkb: c.titleCkb ?? "",
      titleKmr: c.titleKmr ?? "",
      descriptionCkb: c.descriptionCkb ?? "",
      descriptionKmr: c.descriptionKmr ?? "",
      stagedVideoFile: null,
    })),
    fileFormat: d.fileFormat ?? "",
    durationSeconds: d.durationSeconds ?? null,
    publishmentDate: date,
    resolution: d.resolution ?? "",
    fileSizeMb: d.fileSizeMb ?? null,
    tags: { ckb: d.tagsCkb ?? [], kmr: d.tagsKmr ?? [] },
    keywords: { ckb: d.keywordsCkb ?? [], kmr: d.keywordsKmr ?? [] },
    ckbCoverFile: null,
    kmrCoverFile: null,
    hoverCoverFile: null,
    ckbCoverUrl: "",
    kmrCoverUrl: "",
    hoverCoverUrl: "",
    existingCkbCoverUrl: d.ckbCoverUrl ?? null,
    existingKmrCoverUrl: d.kmrCoverUrl ?? null,
    existingHoverCoverUrl: d.hoverCoverUrl ?? null,
  }
}
