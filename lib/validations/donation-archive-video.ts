import { z } from "zod"

import {
  DONATION_ARCHIVE_VIDEO_DESCRIPTION_MAX,
  DONATION_ARCHIVE_VIDEO_TITLE_MAX,
  DONATION_ARCHIVE_VIDEO_URL_MAX,
  type DonationArchiveVideoDto,
} from "@/types/donation-archive-video"

// Every field is optional by design: an editor can type any subset and the
// schema never blocks a blank. Format/length rules fire on what was typed, never
// on what was left empty. The two things a video genuinely cannot work without —
// a title in at least one language and the clip itself — are checked at submit
// time in the dialog instead, so the editor gets a sentence rather than a 400.
export const donationArchiveVideoSchema = z.object({
  titleCkb: z
    .string()
    .max(DONATION_ARCHIVE_VIDEO_TITLE_MAX)
    .optional()
    .nullable(),
  titleKmr: z
    .string()
    .max(DONATION_ARCHIVE_VIDEO_TITLE_MAX)
    .optional()
    .nullable(),
  descriptionCkb: z
    .string()
    .max(DONATION_ARCHIVE_VIDEO_DESCRIPTION_MAX)
    .optional()
    .nullable(),
  descriptionKmr: z
    .string()
    .max(DONATION_ARCHIVE_VIDEO_DESCRIPTION_MAX)
    .optional()
    .nullable(),
  videoUrl: z
    .string()
    .trim()
    .max(DONATION_ARCHIVE_VIDEO_URL_MAX)
    .refine((v) => v === "" || /^(https?:\/\/\S+|\/\S*)$/i.test(v), {
      message: "video_url_format",
    }),
  posterUrl: z
    .string()
    .trim()
    .max(DONATION_ARCHIVE_VIDEO_URL_MAX)
    .refine((v) => v === "" || /^(https?:\/\/\S+|\/\S*)$/i.test(v), {
      message: "poster_url_format",
    })
    .optional()
    .nullable(),
  displayOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
})

export type DonationArchiveVideoFormValues = z.infer<
  typeof donationArchiveVideoSchema
>

export function defaultDonationArchiveVideoValues(
  displayOrder = 0,
): DonationArchiveVideoFormValues {
  return {
    titleCkb: "",
    titleKmr: "",
    descriptionCkb: "",
    descriptionKmr: "",
    videoUrl: "",
    posterUrl: "",
    displayOrder,
    active: true,
  }
}

/**
 * Optional fields come back absent rather than null, so each one is coalesced to
 * `""` — binding `undefined` to an input makes it uncontrolled.
 */
export function donationArchiveVideoDtoToFormValues(
  dto: DonationArchiveVideoDto,
): DonationArchiveVideoFormValues {
  return {
    titleCkb: dto.titleCkb ?? "",
    titleKmr: dto.titleKmr ?? "",
    descriptionCkb: dto.descriptionCkb ?? "",
    descriptionKmr: dto.descriptionKmr ?? "",
    videoUrl: dto.videoUrl ?? "",
    posterUrl: dto.posterUrl ?? "",
    displayOrder: dto.displayOrder ?? 0,
    active: dto.active,
  }
}
