/**
 * One shape for both singleton promo videos — `SoundReklamVideoResponse` and
 * `FilmReklamVideoResponse` are field-for-field identical, so the dashboard
 * carries one type rather than two that must be kept in step.
 */
export type ReklamVideoDto = {
  /** Returned for completeness. No endpoint on either resource takes an id. */
  id: number
  videoUrl: string
  sizeBytes: number | null
  mimeType: string | null
  createdAt: string | null
  /** Rewritten on every replace, which makes it the cache-busting key. */
  updatedAt: string | null
}
