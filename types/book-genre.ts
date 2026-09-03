/**
 * Book genres — one row per genre, edited from the dashboard and read by the
 * book form. Replaces the fixed `BOOK_GENRES` list that used to be compiled
 * into the app; that list survives in `types/writings.ts` only as the set of
 * slugs this dashboard still ships a label and an icon for.
 *
 * The `slug` is the machine key. It is what books carry, what the website's
 * links are built from, and it never changes after creation — renaming a genre
 * means editing `nameCkb` / `nameKmr`, not the slug.
 */

export type BookGenreDto = {
  /** Null only for rows the editor has added but not saved yet. */
  id: number | null
  /** Uppercase ASCII — `NOVEL`, `SHORT_STORY`… Unique per row. */
  slug: string
  nameCkb: string | null
  nameKmr: string | null
  displayOrder: number
  active: boolean
  /** Only sent by some endpoints — how many books carry this genre. */
  bookCount?: number
}

/** The genre as it is embedded in a book response. */
export type BookGenreRefDto = {
  id: number
  slug: string
  nameCkb: string | null
  nameKmr: string | null
}

/** Checked client-side so the API never has to. */
export const BOOK_GENRE_SLUG_MAX = 60
export const BOOK_GENRE_NAME_MAX = 200

/** Same shape the server stores: uppercase ASCII, `_` between words. */
export function normalizeGenreSlug(slug: string): string {
  return slug.trim().toUpperCase()
}

export function isValidGenreSlug(slug: string): boolean {
  return /^[A-Z0-9][A-Z0-9_]*$/.test(normalizeGenreSlug(slug))
}

/**
 * Suggests a slug from whichever name is written in Latin script.
 *
 * Sorani is Arabic script and transliterates to nothing under this rule, so the
 * Kurmanji name is tried first and the Sorani one only as a long shot — if
 * neither yields anything the editor types the slug themselves, which is why
 * the field stays editable at creation rather than being derived silently.
 */
export function suggestGenreSlug(
  nameKmr: string | null | undefined,
  nameCkb: string | null | undefined,
): string {
  for (const source of [nameKmr, nameCkb]) {
    const slug = (source ?? "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, BOOK_GENRE_SLUG_MAX)
    if (slug && /^[A-Z0-9]/.test(slug)) return slug
  }
  return ""
}

/** The backend rejects a genre with both names blank — mirrored in the form. */
export function hasAnyGenreName(
  genre: Pick<BookGenreDto, "nameCkb" | "nameKmr">,
): boolean {
  return Boolean(genre.nameCkb?.trim() || genre.nameKmr?.trim())
}

/** Sorani first, Kurmanji as the fallback, then the machine key. */
export function bookGenreLabel(
  genre: Pick<BookGenreDto, "slug" | "nameCkb" | "nameKmr">,
): string {
  return genre.nameCkb?.trim() || genre.nameKmr?.trim() || genre.slug
}
