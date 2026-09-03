import type { BookGenreFormValues } from "@/lib/validations/book-genre"
import { normalizeGenreSlug, type BookGenreDto } from "@/types/book-genre"

function trimOrNull(s: string | null | undefined): string | null {
  const t = s?.trim()
  return t ? t : null
}

export type BookGenreWritePayload = {
  slug: string
  nameCkb: string | null
  nameKmr: string | null
  displayOrder: number
  active: boolean
}

/**
 * Builds the request body explicitly rather than posting the form object — this
 * is where trimming, the upper-casing and the blank-to-`null` conversion happen.
 *
 * `PUT` replaces the whole row, so every field is always sent, not just the
 * changed one.
 */
export function bookGenreFormValuesToPayload(
  values: BookGenreFormValues,
): BookGenreWritePayload {
  return {
    slug: normalizeGenreSlug(values.slug),
    nameCkb: trimOrNull(values.nameCkb),
    nameKmr: trimOrNull(values.nameKmr),
    displayOrder: Number.isFinite(values.displayOrder)
      ? Number(values.displayOrder)
      : 0,
    active: values.active !== false,
  }
}

/**
 * The row as it stands, ready to be sent straight back.
 *
 * Reordering and the active switch change one field on a row nobody opened a
 * form for. Because `PUT` is a full replace, they still have to send the other
 * four — going through the DTO rather than hand-building a body is what stops a
 * hidden genre's names being blanked by a click on an arrow.
 */
export function bookGenreDtoToPayload(
  dto: BookGenreDto,
  overrides: Partial<BookGenreWritePayload> = {},
): BookGenreWritePayload {
  return {
    slug: normalizeGenreSlug(dto.slug),
    nameCkb: trimOrNull(dto.nameCkb),
    nameKmr: trimOrNull(dto.nameKmr),
    displayOrder: Number.isFinite(dto.displayOrder) ? dto.displayOrder : 0,
    active: dto.active !== false,
    ...overrides,
  }
}

/** One `PUT` a reorder has to make: the row's id and its full replacement body. */
export type BookGenreReorderStep = {
  id: number
  payload: BookGenreWritePayload
}

/** Pure list move — `rows` in their displayed order, one genre lifted to `to`. */
export function moveBookGenre(
  rows: BookGenreDto[],
  from: number,
  to: number,
): BookGenreDto[] {
  if (from === to) return rows
  if (from < 0 || from >= rows.length) return rows
  if (to < 0 || to >= rows.length) return rows
  const next = [...rows]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/**
 * Turns a desired order into the smallest set of writes that produces it.
 *
 * Swapping the two `displayOrder` values either side of a move is the obvious
 * implementation and is wrong whenever the list is not already numbered
 * `0…N-1`: two genres sharing an order (the server settles that tie by id, so
 * the list still looks sorted) swap to no visible effect, and a list numbered
 * 0, 5, 10 drifts further apart with every move. Renumbering by position is
 * always correct and still costs the expected two requests for an adjacent move
 * on a clean list, because rows already matching their index are skipped.
 */
export function planBookGenreReorder(
  ordered: BookGenreDto[],
): BookGenreReorderStep[] {
  const steps: BookGenreReorderStep[] = []
  ordered.forEach((row, index) => {
    if (row.id == null) return
    if (row.displayOrder === index) return
    steps.push({
      id: row.id,
      payload: bookGenreDtoToPayload(row, { displayOrder: index }),
    })
  })
  return steps
}
