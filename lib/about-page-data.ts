import { aboutFormValuesToPayload } from "@/lib/about-form-data"
import {
  aboutDtoToFormValues,
  defaultAboutFormValues,
  type AboutFormValues,
} from "@/lib/validations/about"
import type { AboutPageHeroFormValues } from "@/lib/validations/about-page"
import type { AboutDto } from "@/types/about"

export function mergeAboutFormValues(
  existing: AboutDto | undefined,
  patch: Partial<AboutFormValues>,
): AboutFormValues {
  const base = existing
    ? aboutDtoToFormValues(existing)
    : { ...defaultAboutFormValues }
  return { ...base, ...patch }
}

/**
 * Builds a full-replace About payload out of the freshest server record plus
 * the one slice of fields the calling section card actually owns.
 *
 * Every card on the About page mounts the whole `aboutFormSchema` but renders
 * only its own slice, so passing a card's entire `values` object here sends
 * its mount-time snapshot of *other* sections back to a destructive `PUT` —
 * which is how deleted stats, cleared founder fields and old titles kept
 * coming back. Always hand this the narrow patch.
 *
 * `active` is deliberately never part of the payload: `GET /api/v1/about`
 * (the only list endpoint that exists) returns active records only, so a
 * dashboard-driven deactivation would hide the record from the dashboard
 * itself and the next save would create a duplicate.
 */
export function aboutPatchToPayload(
  existing: AboutDto | undefined,
  patch: Partial<AboutFormValues>,
) {
  return aboutFormValuesToPayload(mergeAboutFormValues(existing, patch), {
    omitActive: true,
  })
}

export function heroFormValuesToAboutPatch(
  values: AboutPageHeroFormValues,
): Partial<AboutFormValues> {
  return {
    heroPosterUrl: values.heroPosterUrl ?? "",
    heroVideoUrl: values.heroVideoUrl ?? "",
    titleCkb: values.titleCkb ?? "",
    titleKmr: values.titleKmr ?? "",
    subtitleCkb: values.subtitleCkb ?? "",
    subtitleKmr: values.subtitleKmr ?? "",
  }
}

export function heroFormValuesToAboutPayload(
  values: AboutPageHeroFormValues,
  existing?: AboutDto,
) {
  const patch = heroFormValuesToAboutPatch(values)
  const merged = mergeAboutFormValues(existing, patch)
  if (!merged.slugCkb?.trim()) {
    merged.slugCkb = "derbare"
  }
  if (!merged.contentLanguages.length) {
    merged.contentLanguages = ["CKB", "KMR"]
  }
  return aboutFormValuesToPayload(merged, { omitActive: true })
}
