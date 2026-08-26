import { z } from "zod"

import {
  SOCIAL_LABEL_MAX,
  SOCIAL_PLATFORM_MAX,
  SOCIAL_URL_MAX,
  type SocialLinkDto,
} from "@/types/social-links"

// Every field is optional by design: an editor can save with any subset filled
// in. Format/length rules fire on what was typed, never on what was left blank.
/** Caps mirror the column widths in §3 so the client rejects before the API does. */
export const socialLinkSchema = z.object({
  platform: z
    .string()
    .trim()
    .max(SOCIAL_PLATFORM_MAX)
    // Upper-cased on save by the server; the same rule is applied client-side so
    // what the editor picked matches what comes back.
    .refine((v) => v === "" || /^[a-z0-9][a-z0-9_-]*$/i.test(v), {
      message: "platform_format",
    }),
  url: z
    .string()
    .trim()
    .max(SOCIAL_URL_MAX)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), {
      message: "url_absolute",
    }),
  labelCkb: z.string().max(SOCIAL_LABEL_MAX).optional().nullable(),
  labelKmr: z.string().max(SOCIAL_LABEL_MAX).optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
})

export type SocialLinkFormValues = z.infer<typeof socialLinkSchema>

export function defaultSocialLinkValues(
  displayOrder = 0,
): SocialLinkFormValues {
  return {
    platform: "",
    url: "",
    labelCkb: "",
    labelKmr: "",
    displayOrder,
    active: true,
  }
}

/**
 * Optional fields come back absent rather than null (§3), so each one is
 * coalesced to `""` — binding `undefined` to an input makes it uncontrolled.
 */
export function socialLinkDtoToFormValues(
  dto: SocialLinkDto,
): SocialLinkFormValues {
  return {
    platform: dto.platform ?? "",
    url: dto.url ?? "",
    labelCkb: dto.labelCkb ?? "",
    labelKmr: dto.labelKmr ?? "",
    displayOrder: dto.displayOrder ?? 0,
    active: dto.active,
  }
}
