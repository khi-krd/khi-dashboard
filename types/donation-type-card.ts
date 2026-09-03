/**
 * The cards behind the donate page's "دەتوانم چی ببەخشم؟" / "What can I donate?"
 * section — one row per card, edited from the dashboard and read by the website.
 *
 * The card with the **lowest `displayOrder` is the big featured card** and the
 * only one whose description the site renders; every other card is a small tile
 * showing its title alone. The numbers printed on the site ("01", "02"…) are the
 * list positions, so nothing here stores them.
 *
 * As elsewhere in this API optional fields come back absent rather than as
 * `null`, so `lib/donation-type-card-normalize.ts` fills each one in explicitly
 * before it reaches the UI.
 */

export type DonationTypeCardDto = {
  /** Null only for rows the editor has added but not saved yet. */
  id: number | null
  titleCkb: string | null
  titleKmr: string | null
  descriptionCkb: string | null
  descriptionKmr: string | null
  /** Required by the backend — a card cannot be saved without a picture. */
  imageUrl: string
  displayOrder: number
  active: boolean
}

/**
 * Checked client-side so the API never has to. Widths match the donation
 * settings columns, which carry the same kind of copy.
 */
export const DONATION_TYPE_CARD_TITLE_MAX = 300
export const DONATION_TYPE_CARD_DESCRIPTION_MAX = 5000
export const DONATION_TYPE_CARD_IMAGE_URL_MAX = 1500

/** The site shows the description of the first card only. */
export const FEATURED_CARD_INDEX = 0

export function isFeaturedCardIndex(index: number): boolean {
  return index === FEATURED_CARD_INDEX
}

/** The backend rejects a card with both titles blank — mirrored in the form. */
export function hasAnyTitle(
  card: Pick<DonationTypeCardDto, "titleCkb" | "titleKmr">,
): boolean {
  return Boolean(card.titleCkb?.trim() || card.titleKmr?.trim())
}
