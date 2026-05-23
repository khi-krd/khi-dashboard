import type { AboutFormValues } from "@/lib/validations/about"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

export type AboutWritePayload = {
  slugCkb: string
  slugKmr?: string | null
  active: boolean
  ckbContent?: {
    title?: string
    subtitle?: string
    metaDescription?: string
    body?: string
  }
  kmrContent?: {
    title?: string
    subtitle?: string
    metaDescription?: string
    body?: string
  }
}

export function aboutFormValuesToPayload(
  values: AboutFormValues,
): AboutWritePayload {
  return {
    slugCkb: values.slugCkb.trim(),
    slugKmr: trimOrUndef(values.slugKmr) ?? null,
    active: values.active,
    ckbContent: values.contentLanguages.includes("CKB")
      ? {
          title: trimOrUndef(values.titleCkb),
          subtitle: trimOrUndef(values.subtitleCkb),
          metaDescription: trimOrUndef(values.seoDescriptionCkb),
          body: values.bodyCkb ?? undefined,
        }
      : undefined,
    kmrContent: values.contentLanguages.includes("KMR")
      ? {
          title: trimOrUndef(values.titleKmr),
          subtitle: trimOrUndef(values.subtitleKmr),
          metaDescription: trimOrUndef(values.seoDescriptionKmr),
          body: values.bodyKmr ?? undefined,
        }
      : undefined,
  }
}
