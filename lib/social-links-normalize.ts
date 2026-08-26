import { normalizePlatformKey, type SocialLinkDto } from "@/types/social-links"

/**
 * Optional fields come back absent rather than null (§3), so each one is filled
 * in as an explicit `null` — otherwise the form binds `undefined` and React
 * flips the input from controlled to uncontrolled mid-edit.
 *
 * Snake_case fallbacks mirror the other normalizers in this codebase: the Spring
 * DTOs are camelCase, but responses assembled elsewhere have historically leaked
 * the column names through.
 */

function coerceStr(v: unknown): string | null {
  if (v == null) return null
  if (typeof v === "string") {
    const t = v.trim()
    return t.length > 0 ? v : null
  }
  return String(v)
}

function coerceNum(v: unknown, fallback: number): number {
  if (v == null || v === "") return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function coerceBool(v: unknown, fallback = true): boolean {
  if (typeof v === "boolean") return v
  if (v === "true" || v === 1 || v === "1") return true
  if (v === "false" || v === 0 || v === "0") return false
  return fallback
}

export function normalizeSocialLink(raw: unknown): SocialLinkDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>

  const id = o.id == null ? null : coerceNum(o.id, Number.NaN)
  const platform = coerceStr(o.platform) ?? ""
  const url = coerceStr(o.url) ?? ""
  // A row with neither half cannot be rendered or edited meaningfully.
  if (!platform && !url) return null

  return {
    id: Number.isFinite(id) ? (id as number) : null,
    platform: normalizePlatformKey(platform),
    url: url.trim(),
    labelCkb: coerceStr(o.labelCkb) ?? coerceStr(o.label_ckb),
    labelKmr: coerceStr(o.labelKmr) ?? coerceStr(o.label_kmr),
    displayOrder: coerceNum(o.displayOrder ?? o.display_order, 0),
    active: coerceBool(o.active, true),
  }
}

function byDisplayOrderThenId(a: SocialLinkDto, b: SocialLinkDto): number {
  if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder
  return (a.id ?? 0) - (b.id ?? 0)
}

/**
 * The server already sorts by `display_order` (§4). Sorting again here keeps the
 * list stable when rows arrive from an optimistic cache write rather than
 * straight from the API, and settles ties the server leaves in insertion order.
 */
export function normalizeSocialLinkList(raw: unknown): SocialLinkDto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizeSocialLink)
    .filter((r): r is SocialLinkDto => r != null)
    .sort(byDisplayOrderThenId)
}
