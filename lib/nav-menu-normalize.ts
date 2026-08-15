import type { NavMenuItemDto, NavMenuLinkDto } from "@/types/nav-menu"

/**
 * The API omits null fields entirely (§3.2), so an item saved with only its
 * required fields comes back with no `labelKmr` key at all. Every optional value
 * is filled in as an explicit `null` here — otherwise the form binds `undefined`
 * and React flips the input from controlled to uncontrolled mid-edit.
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

function normalizeLink(raw: unknown, index: number): NavMenuLinkDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>

  const href = coerceStr(o.href)
  const labelCkb = coerceStr(o.labelCkb) ?? coerceStr(o.label_ckb)
  // A link without either half cannot be rendered or edited meaningfully.
  if (!href && !labelCkb) return null

  const id = o.id == null ? null : coerceNum(o.id, Number.NaN)

  return {
    id: Number.isFinite(id) ? (id as number) : null,
    labelCkb: labelCkb ?? "",
    labelKmr: coerceStr(o.labelKmr) ?? coerceStr(o.label_kmr),
    href: href ?? "",
    displayOrder: coerceNum(o.displayOrder ?? o.display_order, index + 1),
    active: coerceBool(o.active, true),
  }
}

export function normalizeNavMenuItem(raw: unknown): NavMenuItemDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>

  const id = o.id == null ? null : coerceNum(o.id, Number.NaN)
  const rawLinks = Array.isArray(o.links) ? o.links : []

  return {
    id: Number.isFinite(id) ? (id as number) : null,
    itemKey: (coerceStr(o.itemKey) ?? coerceStr(o.item_key) ?? "").trim(),
    labelCkb: coerceStr(o.labelCkb) ?? coerceStr(o.label_ckb) ?? "",
    labelKmr: coerceStr(o.labelKmr) ?? coerceStr(o.label_kmr),
    descriptionCkb:
      coerceStr(o.descriptionCkb) ?? coerceStr(o.description_ckb),
    descriptionKmr:
      coerceStr(o.descriptionKmr) ?? coerceStr(o.description_kmr),
    href: coerceStr(o.href) ?? "",
    imageUrl: coerceStr(o.imageUrl) ?? coerceStr(o.image_url),
    displayOrder: coerceNum(o.displayOrder ?? o.display_order, 0),
    active: coerceBool(o.active, true),
    links: rawLinks
      .map((l, i) => normalizeLink(l, i))
      .filter((l): l is NavMenuLinkDto => l != null)
      .sort(byDisplayOrderThenId),
  }
}

function byDisplayOrderThenId(
  a: { displayOrder: number; id: number | null },
  b: { displayOrder: number; id: number | null },
): number {
  if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder
  return (a.id ?? 0) - (b.id ?? 0)
}

/**
 * The server already sorts by `display_order` then `id` (§3.3). Sorting again
 * here keeps the list stable when rows arrive from an optimistic cache write
 * rather than straight from the API.
 */
export function normalizeNavMenuList(raw: unknown): NavMenuItemDto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizeNavMenuItem)
    .filter((i): i is NavMenuItemDto => i != null)
    .sort(byDisplayOrderThenId)
}
