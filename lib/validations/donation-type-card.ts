import { z } from "zod"

import {
  DONATION_TYPE_CARD_DESCRIPTION_MAX,
  DONATION_TYPE_CARD_IMAGE_URL_MAX,
  DONATION_TYPE_CARD_TITLE_MAX,
  type DonationTypeCardDto,
} from "@/types/donation-type-card"

// Every field is optional by design: an editor can type any subset and the
// schema never blocks a blank. Format/length rules fire on what was typed, never
// on what was left empty. The two things the backend genuinely rejects — a card
// with no title at all, and a card with no picture — are checked at submit time
// in the dialog instead, so the editor gets a sentence rather than a 400.
export const donationTypeCardSchema = z.object({
  titleCkb: z.string().max(DONATION_TYPE_CARD_TITLE_MAX).optional().nullable(),
  titleKmr: z.string().max(DONATION_TYPE_CARD_TITLE_MAX).optional().nullable(),
  descriptionCkb: z
    .string()
    .max(DONATION_TYPE_CARD_DESCRIPTION_MAX)
    .optional()
    .nullable(),
  descriptionKmr: z
    .string()
    .max(DONATION_TYPE_CARD_DESCRIPTION_MAX)
    .optional()
    .nullable(),
  imageUrl: z
    .string()
    .trim()
    .max(DONATION_TYPE_CARD_IMAGE_URL_MAX)
    // Same `optionalUrl` shape the other form schemas use — an absolute http(s)
    // URL or a same-origin path, and blank passes.
    .refine((v) => v === "" || /^(https?:\/\/\S+|\/\S*)$/i.test(v), {
      message: "image_url_format",
    }),
  displayOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
})

export type DonationTypeCardFormValues = z.infer<typeof donationTypeCardSchema>

export function defaultDonationTypeCardValues(
  displayOrder = 0,
): DonationTypeCardFormValues {
  return {
    titleCkb: "",
    titleKmr: "",
    descriptionCkb: "",
    descriptionKmr: "",
    imageUrl: "",
    displayOrder,
    active: true,
  }
}

/**
 * Optional fields come back absent rather than null, so each one is coalesced to
 * `""` — binding `undefined` to an input makes it uncontrolled.
 */
export function donationTypeCardDtoToFormValues(
  dto: DonationTypeCardDto,
): DonationTypeCardFormValues {
  return {
    titleCkb: dto.titleCkb ?? "",
    titleKmr: dto.titleKmr ?? "",
    descriptionCkb: dto.descriptionCkb ?? "",
    descriptionKmr: dto.descriptionKmr ?? "",
    imageUrl: dto.imageUrl ?? "",
    displayOrder: dto.displayOrder ?? 0,
    active: dto.active,
  }
}
