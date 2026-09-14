import type { AboutFormValues } from "@/lib/validations/about"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

export type AboutWritePayload = {
  slugCkb: string
  slugKmr?: string | null
  /**
   * Omitted entirely by the section editors: `AboutService.update` only
   * assigns `active` when the incoming value is non-null, so leaving it out
   * preserves whatever is stored (and defaults to `true` on create).
   */
  active?: boolean
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

/**
 * `PUT /api/v1/about/{id}` is a full replace: every field it receives as
 * `null`/absent is overwritten with empty. That is why **both** language
 * blocks always go out, regardless of `contentLanguages` — that flag only
 * drives which tab/completion bar the editor shows. Gating the payload on it
 * used to wipe the other language's title, subtitle, SEO text and body the
 * moment a record happened to have only one language filled in.
 */
export function aboutFormValuesToPayload(
  values: AboutFormValues,
  options?: { omitActive?: boolean },
): AboutWritePayload {
  return {
    slugCkb: values.slugCkb.trim(),
    slugKmr: trimOrUndef(values.slugKmr) ?? null,
    ...(options?.omitActive ? {} : { active: values.active }),
    founderNameCkb: trimOrUndef(values.founderNameCkb),
    founderNameKmr: trimOrUndef(values.founderNameKmr),
    founderBioCkb: trimOrUndef(values.founderBioCkb),
    founderBioKmr: trimOrUndef(values.founderBioKmr),
    founderImageUrl: trimOrUndef(values.founderImageUrl) ?? null,
    heroVideoUrl: trimOrUndef(values.heroVideoUrl) ?? null,
    heroPosterUrl: trimOrUndef(values.heroPosterUrl) ?? null,
    ckbContent: {
      title: trimOrUndef(values.titleCkb),
      subtitle: trimOrUndef(values.subtitleCkb),
      metaDescription: trimOrUndef(values.seoDescriptionCkb),
      body: values.bodyCkb ?? undefined,
    },
    kmrContent: {
      title: trimOrUndef(values.titleKmr),
      subtitle: trimOrUndef(values.subtitleKmr),
      metaDescription: trimOrUndef(values.seoDescriptionKmr),
      body: values.bodyKmr ?? undefined,
    },
    stats: values.stats
      .filter((s) => s.labelCkb?.trim() || s.labelKmr?.trim() || s.value?.trim())
      .map((s) => ({
        labelCkb: trimOrUndef(s.labelCkb),
        labelKmr: trimOrUndef(s.labelKmr),
        value: trimOrUndef(s.value),
      })),
  }
}
