import type { FeaturedFields } from "@/types/featured"

function coerceBool(v: unknown): boolean {
  return v === true || v === "true" || v === 1
}

function coerceNum(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function parseFeaturedFields(
  raw: Record<string, unknown>,
): FeaturedFields {
  return {
    featured: coerceBool(raw.featured),
    featuredOrder:
      coerceNum(raw.featuredOrder) ?? coerceNum(raw.featured_order),
    featuredOnHome:
      coerceBool(raw.featuredOnHome) || coerceBool(raw.featured_on_home),
    featuredHomeOrder:
      coerceNum(raw.featuredHomeOrder) ?? coerceNum(raw.featured_home_order),
  }
}
