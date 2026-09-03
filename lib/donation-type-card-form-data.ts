import type { DonationTypeCardFormValues } from "@/lib/validations/donation-type-card"
import type { DonationTypeCardDto } from "@/types/donation-type-card"

function trimOrNull(s: string | null | undefined): string | null {
  const t = s?.trim()
  return t ? t : null
}

export type DonationTypeCardWritePayload = {
  titleCkb: string | null
  titleKmr: string | null
  descriptionCkb: string | null
  descriptionKmr: string | null
  imageUrl: string
  displayOrder: number
  active: boolean
}

/**
 * Builds the request body explicitly rather than posting the form object — this
 * is where trimming and the blank-to-`null` conversion happen.
 *
 * `PUT` replaces the whole row, so every field is always sent, not just the
 * changed one.
 */
export function donationTypeCardFormValuesToPayload(
  values: DonationTypeCardFormValues,
): DonationTypeCardWritePayload {
  return {
    titleCkb: trimOrNull(values.titleCkb),
    titleKmr: trimOrNull(values.titleKmr),
    descriptionCkb: trimOrNull(values.descriptionCkb),
    descriptionKmr: trimOrNull(values.descriptionKmr),
    imageUrl: values.imageUrl?.trim() ?? "",
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
 * six — going through the DTO rather than hand-building a body is what stops a
 * hidden card's description being blanked by a click on an arrow.
 */
export function donationTypeCardDtoToPayload(
  dto: DonationTypeCardDto,
  overrides: Partial<DonationTypeCardWritePayload> = {},
): DonationTypeCardWritePayload {
  return {
    titleCkb: trimOrNull(dto.titleCkb),
    titleKmr: trimOrNull(dto.titleKmr),
    descriptionCkb: trimOrNull(dto.descriptionCkb),
    descriptionKmr: trimOrNull(dto.descriptionKmr),
    imageUrl: dto.imageUrl?.trim() ?? "",
    displayOrder: Number.isFinite(dto.displayOrder) ? dto.displayOrder : 0,
    active: dto.active !== false,
    ...overrides,
  }
}

/** One `PUT` a reorder has to make: the row's id and its full replacement body. */
export type DonationTypeCardReorderStep = {
  id: number
  payload: DonationTypeCardWritePayload
}

/** Pure list move — `rows` in their displayed order, one card lifted to `to`. */
export function moveDonationTypeCard(
  rows: DonationTypeCardDto[],
  from: number,
  to: number,
): DonationTypeCardDto[] {
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
 * Swapping the two `displayOrder` values of the rows either side of a move is
 * the obvious implementation and is wrong whenever the rail is not already
 * numbered `0…N-1`: two cards that share an order (the server settles that tie
 * by id, so the list still looks sorted) swap to no visible effect, and a rail
 * numbered 0, 5, 10 drifts further apart with every move. Renumbering by
 * position instead is always correct, and it still costs the expected two
 * requests for an adjacent move on a clean rail, because rows whose number
 * already matches their index are skipped.
 *
 * Rows with no id are drafts that were never saved and have nothing to write.
 */
export function planDonationTypeCardReorder(
  ordered: DonationTypeCardDto[],
): DonationTypeCardReorderStep[] {
  const steps: DonationTypeCardReorderStep[] = []
  ordered.forEach((row, index) => {
    if (row.id == null) return
    if (row.displayOrder === index) return
    steps.push({
      id: row.id,
      payload: donationTypeCardDtoToPayload(row, { displayOrder: index }),
    })
  })
  return steps
}
