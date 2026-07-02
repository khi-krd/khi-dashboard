import { z } from "zod"

import { NS } from "@/components/image-collections/collections-strings"
import type { CollectionDto } from "@/types/image-collections"

const ContentSchema = z.object({
  title: z.string().max(300).optional(),
  description: z.string().optional(),
  location: z.string().max(250).optional(),
  collectedBy: z.string().max(250).optional(),
})

export const ImageItemFormSchema = z.object({
  clientKey: z.string(),
  id: z.number().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  externalUrl: z.string().optional().or(z.literal("")),
  embedUrl: z.string().optional().or(z.literal("")),
  captionCkb: z.string().max(500).optional(),
  captionKmr: z.string().max(500).optional(),
  descriptionCkb: z.string().optional(),
  descriptionKmr: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
  stagedBinary: z.instanceof(File).optional().nullable(),
  fileSizeBytes: z.number().optional().nullable(),
  widthPx: z.number().optional().nullable(),
  heightPx: z.number().optional().nullable(),
  mimeType: z.string().optional().nullable(),
  aspectRatio: z.number().optional().nullable(),
  humanReadableSize: z.string().optional().nullable(),
})

function imageItemHasSource(item: z.infer<typeof ImageItemFormSchema>) {
  return !!(
    item.imageUrl?.trim() ||
    item.externalUrl?.trim() ||
    item.embedUrl?.trim() ||
    item.stagedBinary
  )
}

export const collectionFormSchema = z
  .object({
    collectionType: z.enum(["SINGLE", "GALLERY", "PHOTO_STORY"]),
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
    publishmentDate: z.string().optional().nullable(),
    contentLanguages: z
      .array(z.enum(["CKB", "KMR"]))
      .min(1, NS.validation.languageRequired),
    ckbContent: ContentSchema.optional(),
    kmrContent: ContentSchema.optional(),
    tags: z.object({
      ckb: z.array(z.string()).default([]),
      kmr: z.array(z.string()).default([]),
    }),
    keywords: z.object({
      ckb: z.array(z.string()).default([]),
      kmr: z.array(z.string()).default([]),
    }),
    imageAlbum: z.array(ImageItemFormSchema),
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
    const readyItems = val.imageAlbum.filter(imageItemHasSource)
    if (readyItems.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: NS.validation.albumRequired,
        path: ["imageAlbum"],
      })
    } else {
      val.imageAlbum.forEach((item, index) => {
        const started =
          item.captionCkb?.trim() ||
          item.captionKmr?.trim() ||
          item.imageUrl?.trim() ||
          item.externalUrl?.trim() ||
          item.embedUrl?.trim() ||
          item.stagedBinary
        if (started && !imageItemHasSource(item)) {
          ctx.addIssue({
            code: "custom",
            message: NS.validation.itemSourceRequired,
            path: ["imageAlbum", index, "imageUrl"],
          })
        }
      })
    }
    if (val.collectionType === "SINGLE" && readyItems.length > 1) {
      ctx.addIssue({
        code: "custom",
        message: NS.validation.singleAlbumLimit,
        path: ["imageAlbum"],
      })
    }
    if (val.collectionType === "PHOTO_STORY" && readyItems.length < 2) {
      ctx.addIssue({
        code: "custom",
        message: NS.validation.storyAlbumMinimum,
        path: ["imageAlbum"],
      })
    }
    if (val.contentLanguages.includes("CKB") && !val.ckbContent?.title?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: NS.validation.ckbTitleRequired,
        path: ["ckbContent", "title"],
      })
    }
    if (val.contentLanguages.includes("KMR") && !val.kmrContent?.title?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: NS.validation.kmrTitleRequired,
        path: ["kmrContent", "title"],
      })
    }
  })

export type CollectionFormValues = z.infer<typeof collectionFormSchema>
export type ImageItemFormValues = z.infer<typeof ImageItemFormSchema>

export function createEmptyAlbumItem(sortOrder = 0): ImageItemFormValues {
  return {
    clientKey: crypto.randomUUID(),
    imageUrl: "",
    externalUrl: "",
    embedUrl: "",
    captionCkb: "",
    captionKmr: "",
    descriptionCkb: "",
    descriptionKmr: "",
    sortOrder,
    stagedBinary: null,
  }
}

export function defaultCollectionFormValues(): CollectionFormValues {
  return {
    collectionType: "GALLERY",
    topicId: null,
    clearTopic: false,
    publishmentDate: null,
    contentLanguages: ["CKB"],
    ckbContent: { title: "", description: "", location: "", collectedBy: "" },
    kmrContent: { title: "", description: "", location: "", collectedBy: "" },
    tags: { ckb: [], kmr: [] },
    keywords: { ckb: [], kmr: [] },
    imageAlbum: [],
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
}

export function collectionDtoToFormValues(dto: CollectionDto): CollectionFormValues {
  const album = (dto.imageAlbum ?? []).map((item, i) => ({
    clientKey: crypto.randomUUID(),
    id: item.id,
    imageUrl: item.imageUrl ?? "",
    externalUrl: item.externalUrl ?? "",
    embedUrl: item.embedUrl ?? "",
    captionCkb: item.captionCkb ?? "",
    captionKmr: item.captionKmr ?? "",
    descriptionCkb: item.descriptionCkb ?? "",
    descriptionKmr: item.descriptionKmr ?? "",
    sortOrder: item.sortOrder ?? i,
    stagedBinary: null,
    fileSizeBytes: item.fileSizeBytes,
    widthPx: item.widthPx,
    heightPx: item.heightPx,
    mimeType: item.mimeType,
    aspectRatio: item.aspectRatio,
    humanReadableSize: item.humanReadableSize,
  }))

  return {
    collectionType: dto.collectionType,
    topicId: dto.topicId ?? null,
    clearTopic: false,
    publishmentDate: dto.publishmentDate ?? null,
    contentLanguages:
      dto.contentLanguages?.length > 0 ? dto.contentLanguages : ["CKB"],
    ckbContent: {
      title: dto.ckbContent?.title ?? "",
      description: dto.ckbContent?.description ?? "",
      location: dto.ckbContent?.location ?? "",
      collectedBy: dto.ckbContent?.collectedBy ?? "",
    },
    kmrContent: {
      title: dto.kmrContent?.title ?? "",
      description: dto.kmrContent?.description ?? "",
      location: dto.kmrContent?.location ?? "",
      collectedBy: dto.kmrContent?.collectedBy ?? "",
    },
    tags: { ckb: dto.tagsCkb ?? [], kmr: dto.tagsKmr ?? [] },
    keywords: { ckb: dto.keywordsCkb ?? [], kmr: dto.keywordsKmr ?? [] },
    imageAlbum: album,
    ckbCoverFile: null,
    kmrCoverFile: null,
    hoverCoverFile: null,
    ckbCoverUrl: dto.ckbCoverUrl ?? "",
    kmrCoverUrl: dto.kmrCoverUrl ?? "",
    hoverCoverUrl: dto.hoverCoverUrl ?? "",
    existingCkbCoverUrl: dto.ckbCoverUrl ?? null,
    existingKmrCoverUrl: dto.kmrCoverUrl ?? null,
    existingHoverCoverUrl: dto.hoverCoverUrl ?? null,
  }
}
