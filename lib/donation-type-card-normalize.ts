import type { DonationTypeCardDto } from "@/types/donation-type-card"

/**
 * Optional fields come back absent rather than null, so each one is filled in as
 * an explicit `null` — otherwise the form binds `undefined` and React flips the
 * input from controlled to uncontrolled mid-edit.
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

export function normalizeDonationTypeCard(
  raw: unknown,
): DonationTypeCardDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>

  const id = o.id == null ? null : coerceNum(o.id, Number.NaN)

  return {
    id: Number.isFinite(id) ? (id as number) : null,
    titleCkb: coerceStr(o.titleCkb) ?? coerceStr(o.title_ckb),
    titleKmr: coerceStr(o.titleKmr) ?? coerceStr(o.title_kmr),
    descriptionCkb:
      coerceStr(o.descriptionCkb) ?? coerceStr(o.description_ckb),
    descriptionKmr:
      coerceStr(o.descriptionKmr) ?? coerceStr(o.description_kmr),
    imageUrl: (coerceStr(o.imageUrl) ?? coerceStr(o.image_url) ?? "").trim(),
    displayOrder: coerceNum(o.displayOrder ?? o.display_order, 0),
    active: coerceBool(o.active, true),
  }
}

/** Shared so an optimistic cache write re-sorts exactly the way a fetch does. */
export function compareDonationTypeCards(
  a: DonationTypeCardDto,
  b: DonationTypeCardDto,
): number {
  if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder
  return (a.id ?? 0) - (b.id ?? 0)
}

/**
 * The server already sorts by `display_order`. Sorting again here keeps the list
 * stable when rows arrive from an optimistic cache write rather than straight
 * from the API, and settles ties the server leaves in insertion order — which
 * matters more here than for social links, because position 0 is what makes a
 * card the featured one.
 */
export function normalizeDonationTypeCardList(
  raw: unknown,
): DonationTypeCardDto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizeDonationTypeCard)
    .filter((r): r is DonationTypeCardDto => r != null)
    .sort(compareDonationTypeCards)
}
