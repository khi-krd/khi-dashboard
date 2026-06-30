import type { AboutFormValues } from "@/lib/validations/about"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

export type AboutWritePayload = {
  slugCkb: string
  slugKmr?: string | null
  active: boolean
  founderNameCkb?: string
  founderNameKmr?: string
  founderBioCkb?: string
  founderBioKmr?: string
  founderImageUrl?: string | null
  heroVideoUrl?: string | null
  heroPosterUrl?: string | null
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
  stats?: Array<{
    labelCkb?: string
    labelKmr?: string
    value?: string
  }>
}

export function aboutFormValuesToPayload(
  values: AboutFormValues,
): AboutWritePayload {
  return {
    slugCkb: values.slugCkb.trim(),
    slugKmr: trimOrUndef(values.slugKmr) ?? null,
    active: values.active,
    founderNameCkb: trimOrUndef(values.founderNameCkb),
    founderNameKmr: trimOrUndef(values.founderNameKmr),
    founderBioCkb: trimOrUndef(values.founderBioCkb),
    founderBioKmr: trimOrUndef(values.founderBioKmr),
    founderImageUrl: trimOrUndef(values.founderImageUrl) ?? null,
    heroVideoUrl: trimOrUndef(values.heroVideoUrl) ?? null,
    heroPosterUrl: trimOrUndef(values.heroPosterUrl) ?? null,
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
    stats: values.stats
      .filter((s) => s.labelCkb?.trim() || s.labelKmr?.trim() || s.value?.trim())
      .map((s) => ({
        labelCkb: trimOrUndef(s.labelCkb),
        labelKmr: trimOrUndef(s.labelKmr),
        value: trimOrUndef(s.value),
      })),
  }
}
