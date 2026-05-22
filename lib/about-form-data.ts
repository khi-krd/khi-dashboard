import type { AboutStatus, Language } from "@/types/about"

import type { AboutFormValues } from "@/lib/validations/about"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

export type AboutWritePayload = {
  status: AboutStatus
  slugCkb: string
  slugKmr?: string | null
  heroImageUrl?: string | null
  contentLanguages: Language[]
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
  stats: Array<{
    labelCkb?: string
    labelKmr?: string
    value: string
  }>
}

export function aboutFormValuesToPayload(
  values: AboutFormValues,
): AboutWritePayload {
  const heroImageUrl =
    trimOrUndef(values.heroImageUrl) ??
    trimOrUndef(values.existingHeroImageUrl) ??
    null

  return {
    status: values.status,
    slugCkb: values.slugCkb.trim(),
    slugKmr: trimOrUndef(values.slugKmr) ?? null,
    heroImageUrl,
    contentLanguages: values.contentLanguages,
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
    stats: (values.stats ?? [])
      .map((s) => ({
        labelCkb: trimOrUndef(s.labelCkb),
        labelKmr: trimOrUndef(s.labelKmr),
        value: s.value?.trim() ?? "",
      }))
      .filter((s) => s.value.length > 0),
  }
}
