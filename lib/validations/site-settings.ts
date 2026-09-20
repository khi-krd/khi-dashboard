import { z } from "zod"

import {
  DEFAULT_MAX_FEATURED_SLIDES,
  MAX_MAX_FEATURED_SLIDES,
  MIN_MAX_FEATURED_SLIDES,
  SITE_MEDIA_HOST,
  type SiteSettingsDto,
  type SiteSettingsPayload,
} from "@/types/site-settings"

/**
 * Absolute `https://` only, or blank.
 *
 * The API validates no URL at all — it stores whatever string it is handed —
 * so this is the only check there is. `http://` fails because the site sends
 * `upgrade-insecure-requests`, and a relative path fails because the website
 * and the API are on different hosts, so it would resolve against the wrong
 * origin. Blank is explicitly legal: both pictures have a working fallback.
 */
const brandingUrl = z
  .string()
  .trim()
  .max(1500)
  .refine((v) => v === "" || /^https:\/\//i.test(v), {
    message: "دەبێت بە https:// دەست پێ بکات",
  })

/** Surface colors — free text in the form, hex sanitized on the website. */
const colorField = z.string().trim().max(20)

/**
 * The website's bundled base size for each scale group, in px. The form
 * holds px values Word-style; the API stores the percent of this base.
 */
export const SCALE_BASE_PX = {
  titleFontScale: 28,
  bodyFontScale: 17,
  captionFontScale: 14,
} as const

/** px typed in the form ("18") → percent string stored by the API ("106"). */
function pxToScale(px: string, basePx: number): string {
  const num = Number(px.trim())
  if (px.trim() === "" || !Number.isFinite(num)) return ""
  const percent = Math.round((num / basePx) * 100)
  return String(Math.min(200, Math.max(50, percent)))
}

/** Percent string from the API ("106") → px shown in the form ("18"). */
function scaleToPx(scale: string | null, basePx: number): string {
  const percent = Number(scale?.trim() ?? "")
  if (!scale?.trim() || !Number.isFinite(percent)) return ""
  return String(Math.round((percent / 100) * basePx))
}

/**
 * Type size in px — the Word-style combo value. Empty clears; the website
 * then renders its bundled size, the reset path.
 */
const scaleField = z
  .string()
  .trim()
  .max(10)
  .refine((v) => v === "" || /^\d{1,3}$/.test(v), {
    message: "ژمارەیەک بنووسە",
  })

export const siteSettingsSchema = z.object({
  logoUrl: brandingUrl,
  donateImageUrl: brandingUrl,
  bodyColor: colorField,
  navbarColor: colorField,
  footerColor: colorField,
  collectionColor: colorField,
  titleFontScale: scaleField,
  bodyFontScale: scaleField,
  captionFontScale: scaleField,
  // Optional: an emptied box (NaN from `valueAsNumber`) means "leave the
  // stored value alone" and is omitted from the payload, not a validation
  // failure. The range rules still apply to anything actually typed.
  maxFeaturedSlides: z.preprocess(
    (v) => (typeof v === "number" && Number.isNaN(v) ? undefined : v),
    z
      .number({ message: "ژمارەیەک بنووسە" })
      .int({ message: "ژمارەی تەواو بنووسە" })
      .min(MIN_MAX_FEATURED_SLIDES, {
        message: `کەمترین ${MIN_MAX_FEATURED_SLIDES}`,
      })
      .max(MAX_MAX_FEATURED_SLIDES, {
        message: `زۆرترین ${MAX_MAX_FEATURED_SLIDES}`,
      })
      .optional(),
  ),
})

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>

export function defaultSiteSettingsValues(): SiteSettingsFormValues {
  return {
    logoUrl: "",
    donateImageUrl: "",
    bodyColor: "",
    navbarColor: "",
    footerColor: "",
    collectionColor: "",
    titleFontScale: "",
    bodyFontScale: "",
    captionFontScale: "",
    maxFeaturedSlides: DEFAULT_MAX_FEATURED_SLIDES,
  }
}

export function siteSettingsDtoToFormValues(
  dto: SiteSettingsDto,
): SiteSettingsFormValues {
  return {
    logoUrl: dto.logoUrl ?? "",
    donateImageUrl: dto.donateImageUrl ?? "",
    bodyColor: dto.bodyColor ?? "",
    navbarColor: dto.navbarColor ?? "",
    footerColor: dto.footerColor ?? "",
    collectionColor: dto.collectionColor ?? "",
    titleFontScale: scaleToPx(dto.titleFontScale, SCALE_BASE_PX.titleFontScale),
    bodyFontScale: scaleToPx(dto.bodyFontScale, SCALE_BASE_PX.bodyFontScale),
    captionFontScale: scaleToPx(
      dto.captionFontScale,
      SCALE_BASE_PX.captionFontScale,
    ),
    maxFeaturedSlides: dto.maxFeaturedSlides,
  }
}

/**
 * For the pictures, `""` clears — that is what an editor emptying a picker
 * means. The slide count is the one field with no "clear" concept, so an
 * emptied box is omitted and the stored value stays as it was.
 */
export function formValuesToSiteSettingsPayload(
  values: SiteSettingsFormValues,
): SiteSettingsPayload {
  const payload: SiteSettingsPayload = {
    logoUrl: values.logoUrl.trim(),
    donateImageUrl: values.donateImageUrl.trim(),
    bodyColor: values.bodyColor.trim(),
    navbarColor: values.navbarColor.trim(),
    footerColor: values.footerColor.trim(),
    collectionColor: values.collectionColor.trim(),
    titleFontScale: pxToScale(values.titleFontScale, SCALE_BASE_PX.titleFontScale),
    bodyFontScale: pxToScale(values.bodyFontScale, SCALE_BASE_PX.bodyFontScale),
    captionFontScale: pxToScale(
      values.captionFontScale,
      SCALE_BASE_PX.captionFontScale,
    ),
  }
  if (typeof values.maxFeaturedSlides === "number") {
    payload.maxFeaturedSlides = values.maxFeaturedSlides
  }
  return payload
}

/**
 * Not a validation failure — the API stores it and the row is perfectly valid.
 * It simply will not appear on the website until a deploy allows the host, and
 * that is worth saying out loud next to the field rather than discovering later.
 */
export function isOffSiteMediaHost(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed || !/^https:\/\//i.test(trimmed)) return false
  try {
    return new URL(trimmed).host !== SITE_MEDIA_HOST
  } catch {
    return false
  }
}
