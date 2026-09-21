import { NS } from "@/components/contact/contact-strings"
import {
  extractApiErrorReason,
  extractApiErrorText,
} from "@/lib/api-error"
import type { ContactFormValues } from "@/lib/validations/contact"
import type { ContactDto } from "@/types/contact"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

export type ContactWritePayload = {
  slugCkb: string
  slugKmr?: string | null
  active?: boolean
  displayOrder?: number
  ckbContent?: {
    title?: string
    subtitle?: string
    address?: string
    workingHours?: string
    description?: string
  }
  kmrContent?: {
    title?: string
    subtitle?: string
    address?: string
    workingHours?: string
    description?: string
  }
  phone?: string
  secondaryPhone?: string
  email?: string
  mapEmbedUrl?: string
  latitude?: number
  longitude?: number
  heroImageUrl?: string
  officeType?: string
  badgeCkb?: string
  badgeKmr?: string
}

function anyNonBlank(...fields: (string | null | undefined)[]): boolean {
  return fields.some((f) => !!f?.trim())
}

export function contactFormValuesToPayload(
  values: ContactFormValues,
  existing?: ContactDto | null,
): ContactWritePayload {
  // A language block is sent when the toggle is on *or* anything was typed in
  // it — `contentLanguages` only reflects what the record already had, so
  // gating on it alone silently dropped freshly-typed translations.
  const includeCkb =
    values.contentLanguages.includes("CKB") ||
    anyNonBlank(
      values.titleCkb,
      values.subtitleCkb,
      values.addressCkb,
      values.workingHoursCkb,
      values.descriptionCkb,
    )
  const includeKmr =
    values.contentLanguages.includes("KMR") ||
    anyNonBlank(
      values.titleKmr,
      values.subtitleKmr,
      values.addressKmr,
      values.workingHoursKmr,
      values.descriptionKmr,
    )

  // slugCkb, phone and email are @NotBlank (@Email too) on the API — a blank
  // submit is a guaranteed 400. They can't be cleared server-side anyway, so
  // fall back to the stored value rather than emit a payload built to fail.
  const slugCkb =
    values.slugCkb.trim() || existing?.slugCkb?.trim() || ""
  const phone = trimOrUndef(values.phone) ?? trimOrUndef(existing?.phone)
  const email = trimOrUndef(values.email) ?? trimOrUndef(existing?.email)

  return {
    slugCkb,
    slugKmr: trimOrUndef(values.slugKmr) ?? null,
    active: values.active,
    displayOrder: values.displayOrder ?? undefined,
    ckbContent: includeCkb
      ? {
          title: trimOrUndef(values.titleCkb),
          subtitle: trimOrUndef(values.subtitleCkb),
          address: trimOrUndef(values.addressCkb),
          workingHours: trimOrUndef(values.workingHoursCkb),
          description: values.descriptionCkb ?? undefined,
        }
      : undefined,
    kmrContent: includeKmr
      ? {
          title: trimOrUndef(values.titleKmr),
          subtitle: trimOrUndef(values.subtitleKmr),
          address: trimOrUndef(values.addressKmr),
          workingHours: trimOrUndef(values.workingHoursKmr),
          description: values.descriptionKmr ?? undefined,
        }
      : undefined,
    phone,
    secondaryPhone: trimOrUndef(values.secondaryPhone),
    email,
    mapEmbedUrl: trimOrUndef(values.mapEmbedUrl),
    latitude: Number.isFinite(values.latitude) ? values.latitude! : undefined,
    longitude: Number.isFinite(values.longitude)
      ? values.longitude!
      : undefined,
    // PUT is a full replacement: anything omitted here is nulled server-side,
    // so these round-trip even though the form may never touch them.
    heroImageUrl: trimOrUndef(values.heroImageUrl),
    officeType: trimOrUndef(values.officeType),
    badgeCkb: trimOrUndef(values.badgeCkb),
    badgeKmr: trimOrUndef(values.badgeKmr),
  }
}

/**
 * The backend's slug rejections arrive as English `details.reason` strings
 * ("KMR slug already exists: X") — translate the known patterns so the toast
 * tells the editor which slug to change instead of showing English.
 */
export function contactSaveErrorText(error: unknown): string {
  const reason = extractApiErrorReason(error)
  if (reason) {
    const exists = /^(CKB|KMR) slug already exists: (.+)$/.exec(reason)
    if (exists) {
      return exists[1] === "KMR"
        ? NS.error.slugKmrExists(exists[2])
        : NS.error.slugCkbExists(exists[2])
    }
    if (reason.startsWith("CKB slug and KMR slug must be different")) {
      return NS.validation.slugsMustDiffer
    }
    if (reason.startsWith("CKB slug is required")) {
      return NS.validation.slugCkbRequired
    }
  }
  return extractApiErrorText(error) ?? NS.error.validation
}
