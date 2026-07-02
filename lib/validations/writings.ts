import { z } from "zod"

import { NS } from "@/components/writings/writings-strings"
import { BOOK_GENRES } from "@/types/writings"
import type { WritingDto } from "@/types/writings"

const bookGenreEnum = z.enum(BOOK_GENRES)

const WritingContentSchema = z.object({
  title: z.string().max(300).optional(),
  description: z.string().optional(),
  writer: z.string().max(200).optional(),
  fileUrl: z.string().url().optional().or(z.literal("")),
  fileFormat: z.enum(["PDF", "DOCX", "EPUB", "TXT", "OTHER"]).optional(),
  fileSizeBytes: z.number().int().min(0).default(0),
  pageCount: z.number().int().min(1).optional(),
  genre: z.string().max(150).optional(),
})

export const writingFormSchema = z
  .object({
    bookGenres: z
      .array(bookGenreEnum)
      .min(1, NS.genre.required),
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
    publishedByInstitute: z.boolean().default(false),
    contentLanguages: z
      .array(z.enum(["CKB", "KMR"]))
      .min(1, NS.validation.languageRequired),
    ckbContent: WritingContentSchema.optional(),
    kmrContent: WritingContentSchema.optional(),
    tags: z
      .object({
        ckb: z.array(z.string().max(80)).default([]),
        kmr: z.array(z.string().max(80)).default([]),
      })
      .default({ ckb: [], kmr: [] }),
    keywords: z
      .object({
        ckb: z.array(z.string().max(120)).default([]),
        kmr: z.array(z.string().max(120)).default([]),
      })
      .default({ ckb: [], kmr: [] }),
    seriesId: z.string().optional(),
    seriesName: z.string().max(300).optional(),
    seriesOrder: z.number().min(0).default(1),
    parentBookId: z.number().int().nullable().optional(),
    seriesTotalBooks: z.number().int().min(1).optional(),
    seriesMode: z.enum(["standalone", "series"]).default("standalone"),
    ckbCoverFile: z.instanceof(File).optional().nullable(),
    kmrCoverFile: z.instanceof(File).optional().nullable(),
    hoverCoverFile: z.instanceof(File).optional().nullable(),
    ckbCoverUrl: z.string().optional().nullable(),
    kmrCoverUrl: z.string().optional().nullable(),
    hoverCoverUrl: z.string().optional().nullable(),
    existingCkbCoverUrl: z.string().optional().nullable(),
    existingKmrCoverUrl: z.string().optional().nullable(),
    existingHoverCoverUrl: z.string().optional().nullable(),
    ckbBookFile: z.instanceof(File).optional().nullable(),
    kmrBookFile: z.instanceof(File).optional().nullable(),
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
  })

export type WritingFormValues = z.infer<typeof writingFormSchema>

export const defaultWritingFormValues: WritingFormValues = {
  bookGenres: [],
  topicId: null,
  clearTopic: false,
  publishedByInstitute: false,
  contentLanguages: ["CKB"],
  ckbContent: { title: "", description: "", writer: "", fileUrl: "", fileSizeBytes: 0, genre: "" },
  kmrContent: { title: "", description: "", writer: "", fileUrl: "", fileSizeBytes: 0, genre: "" },
  tags: { ckb: [], kmr: [] },
  keywords: { ckb: [], kmr: [] },
  seriesOrder: 1,
  parentBookId: null,
  seriesMode: "standalone",
  ckbCoverFile: null,
  kmrCoverFile: null,
  hoverCoverFile: null,
  ckbCoverUrl: "",
  kmrCoverUrl: "",
  hoverCoverUrl: "",
  existingCkbCoverUrl: null,
  existingKmrCoverUrl: null,
  existingHoverCoverUrl: null,
  ckbBookFile: null,
  kmrBookFile: null,
}

export function writingDtoToFormValues(dto: WritingDto): WritingFormValues {
  const isSeries =
    (dto.seriesInfo?.totalBooks ?? dto.seriesTotalBooks ?? 1) > 1 ||
    !!dto.parentBookId
  return {
    bookGenres: [...(dto.bookGenres ?? [])],
    topicId: dto.topicId ?? null,
    clearTopic: false,
    publishedByInstitute: !!dto.publishedByInstitute,
    contentLanguages: dto.contentLanguages?.length
      ? [...dto.contentLanguages]
      : ["CKB"],
    ckbContent: {
      title: dto.ckbContent?.title ?? "",
      description: dto.ckbContent?.description ?? "",
      writer: dto.ckbContent?.writer ?? "",
      fileUrl: dto.ckbContent?.fileUrl ?? "",
      fileFormat: dto.ckbContent?.fileFormat ?? undefined,
      fileSizeBytes: dto.ckbContent?.fileSizeBytes ?? 0,
      pageCount: dto.ckbContent?.pageCount ?? undefined,
      genre: dto.ckbContent?.genre ?? "",
    },
    kmrContent: {
      title: dto.kmrContent?.title ?? "",
      description: dto.kmrContent?.description ?? "",
      writer: dto.kmrContent?.writer ?? "",
      fileUrl: dto.kmrContent?.fileUrl ?? "",
      fileFormat: dto.kmrContent?.fileFormat ?? undefined,
      fileSizeBytes: dto.kmrContent?.fileSizeBytes ?? 0,
      pageCount: dto.kmrContent?.pageCount ?? undefined,
      genre: dto.kmrContent?.genre ?? "",
    },
    tags: {
      ckb: [...(dto.tagsCkb ?? [])],
      kmr: [...(dto.tagsKmr ?? [])],
    },
    keywords: {
      ckb: [...(dto.keywordsCkb ?? [])],
      kmr: [...(dto.keywordsKmr ?? [])],
    },
    seriesId: dto.seriesId ?? undefined,
    seriesName: dto.seriesName ?? undefined,
    seriesOrder: dto.seriesOrder ?? dto.seriesInfo?.seriesOrder ?? 1,
    parentBookId: dto.parentBookId ?? dto.seriesInfo?.parentBookId ?? null,
    seriesTotalBooks:
      dto.seriesTotalBooks ?? dto.seriesInfo?.seriesTotalBooks ?? undefined,
    seriesMode: isSeries ? "series" : "standalone",
    ckbCoverFile: null,
    kmrCoverFile: null,
    hoverCoverFile: null,
    ckbCoverUrl: "",
    kmrCoverUrl: "",
    hoverCoverUrl: "",
    existingCkbCoverUrl: dto.ckbCoverUrl ?? null,
    existingKmrCoverUrl: dto.kmrCoverUrl ?? null,
    existingHoverCoverUrl: dto.hoverCoverUrl ?? null,
    ckbBookFile: null,
    kmrBookFile: null,
  }
}
