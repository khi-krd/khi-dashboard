import type { DonationArchiveVideoDto } from "@/types/donation-archive-video"

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

export function normalizeDonationArchiveVideo(
  raw: unknown,
): DonationArchiveVideoDto | null {
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
    videoUrl: (coerceStr(o.videoUrl) ?? coerceStr(o.video_url) ?? "").trim(),
    posterUrl: coerceStr(o.posterUrl) ?? coerceStr(o.poster_url),
    displayOrder: coerceNum(o.displayOrder ?? o.display_order, 0),
    active: coerceBool(o.active, true),
  }
}

/** Shared so an optimistic cache write re-sorts exactly the way a fetch does. */
export function compareDonationArchiveVideos(
  a: DonationArchiveVideoDto,
  b: DonationArchiveVideoDto,
): number {
  if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder
  return (a.id ?? 0) - (b.id ?? 0)
}

/** The server already sorts; re-sorting keeps optimistic writes consistent. */
export function normalizeDonationArchiveVideoList(
  raw: unknown,
): DonationArchiveVideoDto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizeDonationArchiveVideo)
    .filter((r): r is DonationArchiveVideoDto => r != null)
    .sort(compareDonationArchiveVideos)
}
