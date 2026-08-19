import { z } from "zod"

import { NS } from "@/components/sounds/sounds-strings"
import type { SoundDto } from "@/types/sounds"

const SoundContentSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().optional(),
})

export const BrochureFormSchema = z.object({
  clientKey: z.string(),
  id: z.number().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  caption: z.string().max(300).optional(),
  brochureOrder: z.number().int().optional(),
  stagedImageFile: z.instanceof(File).optional().nullable(),
})

export const SoundFileFormSchema = z.object({
  clientKey: z.string(),
  id: z.number().optional(),
  fileUrl: z.string().optional().or(z.literal("")),
  externalUrl: z.string().optional().or(z.literal("")),
  embedUrl: z.string().optional().or(z.literal("")),
  title: z.string().max(300).optional(),
  fileType: z.enum(["AUDIO", "VIDEO", "DOCUMENT", "OTHER"]).default("AUDIO"),
  // A typed-then-cleared numeric input yields NaN; treat it as unset.
  publishmentYear: z.preprocess(
    (v) => (typeof v === "number" && Number.isNaN(v) ? undefined : v),
    z.number().int().min(1900).max(2100).optional().nullable(),
  ),
  fileFormat: z.string().max(50).optional().nullable(),
  sizeBytes: z.number().int().min(0).default(0),
  durationSeconds: z.number().int().min(0).default(0),
  bitRate: z.string().max(50).optional().nullable(),
  sampleRate: z.string().max(50).optional().nullable(),
  audioChannel: z.enum(["STEREO", "MONO"]).optional().nullable(),
  form: z.string().max(150).optional().nullable(),
  genre: z.string().max(100).optional().nullable(),
  recordingVenue: z.string().max(500).optional().nullable(),
  brochures: z.array(BrochureFormSchema).default([]),
  stagedAudioFile: z.instanceof(File).optional().nullable(),
})

export const AttachmentFormSchema = z.object({
  clientKey: z.string(),
  id: z.number().optional(),
  fileUrl: z.string().optional().or(z.literal("")),
  title: z.string().max(300).optional(),
  attachmentType: z
    .enum(["PDF", "VIDEO", "IMAGE", "AUDIO", "OTHER"])
    .default("OTHER"),
  sizeBytes: z.number().int().min(0).default(0),
  mimeType: z.string().max(100).optional().nullable(),
  attachmentOrder: z.number().int().optional(),
  stagedAttachmentFile: z.instanceof(File).optional().nullable(),
})

// Every field is optional by design: an editor can save a draft with any
// subset filled in. Only format/length rules remain — they fire on what was
// typed, never on what was left blank. Sourceless file/attachment rows are
// filtered by the payload builder before send.
export const soundFormSchema = z
  .object({
    trackState: z.enum(["SINGLE", "MULTI"]),
    soundType: z.string().max(100),
    topicId: z.number().int().nullable().optional(),
    newTopic: z
      .object({
        nameCkb: z.string().optional(),
        nameKmr: z.string().optional(),
      })
      .optional(),
    clearTopic: z.boolean().optional(),
    contentLanguages: z
      .array(z.enum(["CKB", "KMR"]))
      .min(1, NS.validation.languageRequired),
    ckbContent: SoundContentSchema.optional(),
    kmrContent: SoundContentSchema.optional(),
    tags: z.object({
      ckb: z.array(z.string().max(60)),
      kmr: z.array(z.string().max(60)),
    }),
    keywords: z.object({
      ckb: z.array(z.string().max(100)),
      kmr: z.array(z.string().max(100)),
    }),
    files: z.array(SoundFileFormSchema).default([]),
    attachments: z.array(AttachmentFormSchema).default([]),
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

export type SoundFormValues = z.infer<typeof soundFormSchema>
export type SoundFileFormValues = z.infer<typeof SoundFileFormSchema>
export type BrochureFormValues = z.infer<typeof BrochureFormSchema>
export type AttachmentFormValues = z.infer<typeof AttachmentFormSchema>

function newClientKey() {
  return `k-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const defaultSoundFormValues: SoundFormValues = {
  trackState: "SINGLE",
  soundType: "",
  topicId: null,
  newTopic: undefined,
  clearTopic: false,
  contentLanguages: ["CKB"],
  ckbContent: { title: "", description: "" },
  kmrContent: { title: "", description: "" },
  tags: { ckb: [], kmr: [] },
  keywords: { ckb: [], kmr: [] },
  files: [],
  attachments: [],
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

export function soundDtoToFormValues(dto: SoundDto): SoundFormValues {
  return {
    trackState: dto.trackState ?? "SINGLE",
    soundType: dto.soundType ?? "",
    topicId: dto.topicId ?? null,
    newTopic: undefined,
    clearTopic: false,
    contentLanguages:
      dto.contentLanguages?.length > 0 ? dto.contentLanguages : ["CKB"],
    ckbContent: {
      title: dto.ckbContent?.title ?? "",
      description: dto.ckbContent?.description ?? "",
    },
    kmrContent: {
      title: dto.kmrContent?.title ?? "",
      description: dto.kmrContent?.description ?? "",
    },
    tags: { ckb: dto.tagsCkb ?? [], kmr: dto.tagsKmr ?? [] },
    keywords: { ckb: dto.keywordsCkb ?? [], kmr: dto.keywordsKmr ?? [] },
    files: (dto.files ?? []).map((f) => ({
      clientKey: newClientKey(),
      id: f.id,
      fileUrl: f.fileUrl ?? "",
      externalUrl: f.externalUrl ?? "",
      embedUrl: f.embedUrl ?? "",
      title: f.title ?? "",
      fileType: f.fileType ?? "AUDIO",
      publishmentYear: f.publishmentYear ?? null,
      fileFormat: f.fileFormat ?? "",
      sizeBytes: f.sizeBytes ?? 0,
      durationSeconds: f.durationSeconds ?? 0,
      bitRate: f.bitRate ?? "",
      sampleRate: f.sampleRate ?? "",
      audioChannel: f.audioChannel ?? "STEREO",
      form: f.form ?? "",
      genre: f.genre ?? "",
      recordingVenue: f.recordingVenue ?? "",
      brochures: (f.brochures ?? []).map((b, bi) => ({
        clientKey: newClientKey(),
        id: b.id,
        imageUrl: b.imageUrl ?? "",
        caption: b.caption ?? "",
        brochureOrder: b.brochureOrder ?? bi,
        stagedImageFile: null,
      })),
      stagedAudioFile: null,
    })),
    attachments: (dto.attachments ?? []).map((a, i) => ({
      clientKey: newClientKey(),
      id: a.id,
      fileUrl: a.fileUrl ?? "",
      title: a.title ?? "",
      attachmentType: a.attachmentType ?? "OTHER",
      sizeBytes: a.sizeBytes ?? 0,
      mimeType: a.mimeType ?? "",
      attachmentOrder: a.attachmentOrder ?? i,
      stagedAttachmentFile: null,
    })),
    ckbCoverFile: null,
    kmrCoverFile: null,
    hoverCoverFile: null,
    ckbCoverUrl: "",
    kmrCoverUrl: "",
    hoverCoverUrl: "",
    existingCkbCoverUrl: dto.ckbCoverUrl ?? null,
    existingKmrCoverUrl: dto.kmrCoverUrl ?? null,
    existingHoverCoverUrl: dto.hoverCoverUrl ?? null,
  }
}

export function createEmptyFileRow(): SoundFileFormValues {
  return {
    clientKey: newClientKey(),
    fileUrl: "",
    externalUrl: "",
    embedUrl: "",
    title: "",
    fileType: "AUDIO",
    publishmentYear: null,
    fileFormat: "",
    sizeBytes: 0,
    durationSeconds: 0,
    bitRate: "",
    sampleRate: "",
    audioChannel: "STEREO",
    form: "",
    genre: "",
    recordingVenue: "",
    brochures: [],
    stagedAudioFile: null,
  }
}

export function createEmptyAttachmentRow(): AttachmentFormValues {
  return {
    clientKey: newClientKey(),
    fileUrl: "",
    title: "",
    attachmentType: "OTHER",
    sizeBytes: 0,
    mimeType: "",
    attachmentOrder: 0,
    stagedAttachmentFile: null,
  }
}
