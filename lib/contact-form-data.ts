import type { ContactFormValues } from "@/lib/validations/contact"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

export type ContactWritePayload = {
  slugCkb: string
  slugKmr?: string | null
  active?: boolean
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
}

export function contactFormValuesToPayload(
  values: ContactFormValues,
): ContactWritePayload {
  return {
    slugCkb: values.slugCkb.trim(),
    slugKmr: trimOrUndef(values.slugKmr) ?? null,
    active: values.active,
    ckbContent: values.contentLanguages.includes("CKB")
      ? {
          title: trimOrUndef(values.titleCkb),
          subtitle: trimOrUndef(values.subtitleCkb),
          address: trimOrUndef(values.addressCkb),
          workingHours: trimOrUndef(values.workingHoursCkb),
          description: values.descriptionCkb ?? undefined,
        }
      : undefined,
    kmrContent: values.contentLanguages.includes("KMR")
      ? {
          title: trimOrUndef(values.titleKmr),
          subtitle: trimOrUndef(values.subtitleKmr),
          address: trimOrUndef(values.addressKmr),
          workingHours: trimOrUndef(values.workingHoursKmr),
          description: values.descriptionKmr ?? undefined,
        }
      : undefined,
    phone: trimOrUndef(values.phone),
    secondaryPhone: trimOrUndef(values.secondaryPhone),
    email: trimOrUndef(values.email),
    mapEmbedUrl: trimOrUndef(values.mapEmbedUrl),
    latitude: values.latitude ?? undefined,
    longitude: values.longitude ?? undefined,
  }
}
