import type { SocialLinkFormValues } from "@/lib/validations/social-links"
import { normalizePlatformKey } from "@/types/social-links"

function trimOrNull(s: string | null | undefined): string | null {
  const t = s?.trim()
  return t ? t : null
}

export type SocialLinkWritePayload = {
  platform: string
  url: string
  labelCkb: string | null
  labelKmr: string | null
  displayOrder: number
  active: boolean
}

/**
 * Builds the request body explicitly rather than posting the form object — this
 * is where trimming, the upper-casing and the blank-to-`null` conversion happen
 * (§4).
 *
 * `PUT` replaces the whole row, so every field is always sent, not just the
 * changed one.
 */
export function socialLinkFormValuesToPayload(
  values: SocialLinkFormValues,
): SocialLinkWritePayload {
  return {
    platform: normalizePlatformKey(values.platform),
    url: values.url.trim(),
    labelCkb: trimOrNull(values.labelCkb),
    labelKmr: trimOrNull(values.labelKmr),
    displayOrder: Number.isFinite(values.displayOrder)
      ? Number(values.displayOrder)
      : 0,
    active: values.active !== false,
  }
}
