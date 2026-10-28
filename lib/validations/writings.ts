import { z } from "zod"

import { NS } from "@/components/writings/writings-strings"
import type { WritingDto } from "@/types/writings"

// A typed-then-cleared numeric input yields NaN; treat it as unset.
const optionalPositiveInt = z.preprocess(
  (v) => (typeof v === "number" && Number.isNaN(v) ? undefined : v),
  z.number().int().min(1).optional(),
)

const WritingContentSchema = z.object({
  title: z.string().max(300).optional(),
  description: z.string().optional(),
  fileUrl: z.string().url().optional().or(z.literal("")),
  fileFormat: z.enum(["PDF", "DOCX", "EPUB", "TXT", "OTHER"]).optional(),
  fileSizeBytes: z.number().int().min(0).default(0),
  pageCount: optionalPositiveInt,
  location: z.string().max(255).optional(),
})

// Every field is optional by design: an editor can save a draft with any
// subset filled in. Only format/length rules remain — they fire on what was
// typed, never on what was left blank. contentLanguages keeps min(1): the
// language toggle UI guarantees at least one is always active.
export const writingFormSchema = z
  .object({
    // Open strings, not an enum: genres are database rows managed from
    // /dashboard/writings/genres, so a book can legitimately carry a slug this
    // build has never heard of.
    bookGenres: z.array(z.string()),
    topicIds: z.array(z.number().int()).default([]),
    newTopics: z
      .array(
        z.object({
          nameCkb: z.string().optional(),
          nameKmr: z.string().optional(),
        }),
      )
      .default([]),
    publishedByInstitute: z.boolean().default(true),
    bookLanguageCkb: z.string().max(120).default(""),
    bookLanguageKmr: z.string().max(120).default(""),
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
    persons: z
      .array(
        z.object({
          roleCkb: z.string().max(120).optional(),
          roleKmr: z.string().max(120).optional(),
          nameCkb: z.string().max(200).optional(),
          nameKmr: z.string().max(200).optional(),
          nicknameCkb: z.string().max(200).optional(),
          nicknameKmr: z.string().max(200).optional(),
        }),
      )
      .default([]),
    seriesId: z.string().optional(),
    seriesName: z.string().max(300).optional(),
    seriesOrder: z.number().min(0).default(1),
    parentBookId: z.number().int().nullable().optional(),
    seriesTotalBooks: optionalPositiveInt,
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
  .superRefine((values, ctx) => {
    // The server rejects a declared language whose title is blank — and on the
    // update path an empty title would silently clear the existing one. Check
    // per declared language so the failing field gets its own inline error.
    if (
      values.contentLanguages.includes("CKB") &&
      !values.ckbContent?.title?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["ckbContent", "title"],
        message: NS.validation.titleRequired,
      })
    }
    if (
      values.contentLanguages.includes("KMR") &&
      !values.kmrContent?.title?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["kmrContent", "title"],
        message: NS.validation.titleRequired,
      })
    }
  })

export type WritingFormValues = z.infer<typeof writingFormSchema>

export const defaultWritingFormValues: WritingFormValues = {
  bookGenres: [],
  topicIds: [],
  newTopics: [],
  publishedByInstitute: true,
  bookLanguageCkb: "",
  bookLanguageKmr: "",
  contentLanguages: ["CKB"],
  ckbContent: { title: "", description: "", fileUrl: "", fileSizeBytes: 0, location: "" },
  kmrContent: { title: "", description: "", fileUrl: "", fileSizeBytes: 0, location: "" },
  tags: { ckb: [], kmr: [] },
  keywords: { ckb: [], kmr: [] },
  persons: [],
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
    topicIds:
      dto.topics?.length
        ? dto.topics.map((t) => t.id)
        : dto.topicId != null
          ? [dto.topicId]
          : [],
    newTopics: [],
    publishedByInstitute: !!dto.publishedByInstitute,
    bookLanguageCkb: dto.bookLanguageCkb ?? "",
    bookLanguageKmr: dto.bookLanguageKmr ?? "",
    contentLanguages: dto.contentLanguages?.length
      ? [...dto.contentLanguages]
      : ["CKB"],
    ckbContent: {
      title: dto.ckbContent?.title ?? "",
      description: dto.ckbContent?.description ?? "",
      fileUrl: dto.ckbContent?.fileUrl ?? "",
      fileFormat: dto.ckbContent?.fileFormat ?? undefined,
      fileSizeBytes: dto.ckbContent?.fileSizeBytes ?? 0,
      pageCount: dto.ckbContent?.pageCount ?? undefined,
      location: dto.ckbContent?.location ?? "",
    },
    kmrContent: {
      title: dto.kmrContent?.title ?? "",
      description: dto.kmrContent?.description ?? "",
      fileUrl: dto.kmrContent?.fileUrl ?? "",
      fileFormat: dto.kmrContent?.fileFormat ?? undefined,
      fileSizeBytes: dto.kmrContent?.fileSizeBytes ?? 0,
      pageCount: dto.kmrContent?.pageCount ?? undefined,
      location: dto.kmrContent?.location ?? "",
    },
    tags: {
      ckb: [...(dto.tagsCkb ?? [])],
      kmr: [...(dto.tagsKmr ?? [])],
    },
    keywords: {
      ckb: [...(dto.keywordsCkb ?? [])],
      kmr: [...(dto.keywordsKmr ?? [])],
    },
    persons: (dto.persons ?? []).map((p) => ({
      roleCkb: p.roleCkb ?? "",
      roleKmr: p.roleKmr ?? "",
      nameCkb: p.nameCkb ?? "",
      nameKmr: p.nameKmr ?? "",
      nicknameCkb: p.nicknameCkb ?? "",
      nicknameKmr: p.nicknameKmr ?? "",
    })),
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
    // Seed the URL inputs with the persisted URL — the backend resolves a
    // re-sent identical URL as a no-op, and a staged file wins over it.
    ckbCoverUrl: dto.ckbCoverUrl ?? "",
    kmrCoverUrl: dto.kmrCoverUrl ?? "",
    hoverCoverUrl: dto.hoverCoverUrl ?? "",
    existingCkbCoverUrl: dto.ckbCoverUrl ?? null,
    existingKmrCoverUrl: dto.kmrCoverUrl ?? null,
    existingHoverCoverUrl: dto.hoverCoverUrl ?? null,
    ckbBookFile: null,
    kmrBookFile: null,
  }
}
