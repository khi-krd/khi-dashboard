import { unwrapApiData } from "@/lib/api-unwrap"
import {
  DEFAULT_MAX_FEATURED_SLIDES,
  type SiteSettingsDto,
} from "@/types/site-settings"

function coerceStr(v: unknown): string | null {
  if (typeof v !== "string") return null
  const trimmed = v.trim()
  return trimmed ? trimmed : null
}

function coerceNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim()) {
    const parsed = Number(v)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export function normalizeSiteSettingsDto(raw: unknown): SiteSettingsDto {
  const unwrapped = unwrapApiData<unknown>(raw)
  const o = (unwrapped && typeof unwrapped === "object" ? unwrapped : {}) as Record<
    string,
    unknown
  >
  return {
    id: coerceNum(o.id),
    logoUrl: coerceStr(o.logoUrl) ?? coerceStr(o.logo_url),
    donateImageUrl:
      coerceStr(o.donateImageUrl) ?? coerceStr(o.donate_image_url),
    // Falls back rather than defaulting to 0: the cap drives the featured
    // budget meter, and a zero there would read as "no slides allowed".
    maxFeaturedSlides:
      coerceNum(o.maxFeaturedSlides) ??
      coerceNum(o.max_featured_slides) ??
      DEFAULT_MAX_FEATURED_SLIDES,
    updatedAt: coerceStr(o.updatedAt) ?? coerceStr(o.updated_at),
  }
}
