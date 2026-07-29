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

export function aboutPatchToPayload(
  existing: AboutDto | undefined,
  patch: Partial<AboutFormValues>,
) {
  return aboutFormValuesToPayload(mergeAboutFormValues(existing, patch))
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
    merged.contentLanguages = ["CKB"]
  }
  return aboutFormValuesToPayload(merged)
}
