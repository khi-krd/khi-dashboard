import type { DonationArchiveVideoFormValues } from "@/lib/validations/donation-archive-video"
import type { DonationArchiveVideoDto } from "@/types/donation-archive-video"

function trimOrNull(s: string | null | undefined): string | null {
  const t = s?.trim()
  return t ? t : null
}

export type DonationArchiveVideoWritePayload = {
  titleCkb: string | null
  titleKmr: string | null
  descriptionCkb: string | null
  descriptionKmr: string | null
  videoUrl: string
  posterUrl: string | null
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
export function donationArchiveVideoFormValuesToPayload(
  values: DonationArchiveVideoFormValues,
): DonationArchiveVideoWritePayload {
  return {
    titleCkb: trimOrNull(values.titleCkb),
    titleKmr: trimOrNull(values.titleKmr),
    descriptionCkb: trimOrNull(values.descriptionCkb),
    descriptionKmr: trimOrNull(values.descriptionKmr),
    videoUrl: values.videoUrl?.trim() ?? "",
    posterUrl: trimOrNull(values.posterUrl),
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
 * fields — going through the DTO rather than hand-building a body is what stops
 * a hidden video's texts being blanked by a click on an arrow.
 */
export function donationArchiveVideoDtoToPayload(
  dto: DonationArchiveVideoDto,
  overrides: Partial<DonationArchiveVideoWritePayload> = {},
): DonationArchiveVideoWritePayload {
  return {
    titleCkb: trimOrNull(dto.titleCkb),
    titleKmr: trimOrNull(dto.titleKmr),
    descriptionCkb: trimOrNull(dto.descriptionCkb),
    descriptionKmr: trimOrNull(dto.descriptionKmr),
    videoUrl: dto.videoUrl?.trim() ?? "",
    posterUrl: trimOrNull(dto.posterUrl),
    displayOrder: Number.isFinite(dto.displayOrder) ? dto.displayOrder : 0,
    active: dto.active !== false,
    ...overrides,
  }
}

/** One `PUT` a reorder has to make: the row's id and its full replacement body. */
export type DonationArchiveVideoReorderStep = {
  id: number
  payload: DonationArchiveVideoWritePayload
}

/** Pure list move — `rows` in their displayed order, one video lifted to `to`. */
export function moveDonationArchiveVideo(
  rows: DonationArchiveVideoDto[],
  from: number,
  to: number,
): DonationArchiveVideoDto[] {
  if (from === to) return rows
  if (from < 0 || from >= rows.length) return rows
  if (to < 0 || to >= rows.length) return rows
  const next = [...rows]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/**
 * Turns a desired order into the smallest set of writes that produces it —
 * renumbering by position, skipping rows already on their index. Rows with no
 * id are drafts that were never saved and have nothing to write.
 */
export function planDonationArchiveVideoReorder(
  ordered: DonationArchiveVideoDto[],
): DonationArchiveVideoReorderStep[] {
  const steps: DonationArchiveVideoReorderStep[] = []
  ordered.forEach((row, index) => {
    if (row.id == null) return
    if (row.displayOrder === index) return
    steps.push({
      id: row.id,
      payload: donationArchiveVideoDtoToPayload(row, { displayOrder: index }),
    })
  })
  return steps
}
