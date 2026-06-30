import { z } from "zod"

export const mediaGalleryItemSchema = z.object({
  clientKey: z.string(),
  url: z.string(),
  kind: z.enum(["IMAGE", "VIDEO", "AUDIO"]).default("IMAGE"),
  thumbnailUrl: z.string().optional().default(""),
  captionCkb: z.string().max(500).optional().default(""),
  captionKmr: z.string().max(500).optional().default(""),
  sortOrder: z.number().int().min(0).default(0),
})

export const mediaGalleryFieldSchema = z.array(mediaGalleryItemSchema).default([])
