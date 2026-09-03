import {
  normalizeGenreSlug,
  type BookGenreDto,
  type BookGenreRefDto,
} from "@/types/book-genre"

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

export function normalizeBookGenre(raw: unknown): BookGenreDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>

  const id = o.id == null ? null : coerceNum(o.id, Number.NaN)
  const slug = normalizeGenreSlug(coerceStr(o.slug) ?? "")
  // A row with no slug cannot be attached to a book or linked to, so there is
  // nothing the editor could do with it.
  if (!slug) return null

  const bookCount = o.bookCount ?? o.book_count
  return {
    id: Number.isFinite(id) ? (id as number) : null,
    slug,
    nameCkb: coerceStr(o.nameCkb) ?? coerceStr(o.name_ckb),
    nameKmr: coerceStr(o.nameKmr) ?? coerceStr(o.name_kmr),
    displayOrder: coerceNum(o.displayOrder ?? o.display_order, 0),
    active: coerceBool(o.active, true),
    bookCount: bookCount == null ? undefined : coerceNum(bookCount, 0),
  }
}

/** The genre as embedded in a book response — id and slug are the useful half. */
export function normalizeBookGenreRef(raw: unknown): BookGenreRefDto | null {
  const dto = normalizeBookGenre(raw)
  if (!dto || dto.id == null) return null
  return {
    id: dto.id,
    slug: dto.slug,
    nameCkb: dto.nameCkb,
    nameKmr: dto.nameKmr,
  }
}

/** Shared so an optimistic cache write re-sorts exactly the way a fetch does. */
export function compareBookGenres(a: BookGenreDto, b: BookGenreDto): number {
  if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder
  return (a.id ?? 0) - (b.id ?? 0)
}

/**
 * The server already sorts by `display_order`. Sorting again here keeps the list
 * stable when rows arrive from an optimistic cache write rather than straight
 * from the API, and settles ties the server leaves in insertion order — which
 * matters because this order is the order of the chips on the website.
 */
export function normalizeBookGenreList(raw: unknown): BookGenreDto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizeBookGenre)
    .filter((r): r is BookGenreDto => r != null)
    .sort(compareBookGenres)
}
