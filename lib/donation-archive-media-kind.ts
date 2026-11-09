import { classifyVideoUrl } from "@/lib/video-embed"
import type { DonationArchiveVideoDto } from "@/types/donation-archive-video"

const IMAGE_FILE_EXT =
  /\.(jpe?g|png|webp|avif|gif|svg|bmp|tiff?|jfif|heic|heif)(\?|#|$)/i

/**
 * There is no explicit "kind" column on this table — the website tells a
 * photo from a clip by the same URL heuristic this mirrors exactly
 * (src/lib/api/donations.ts on the website side): not a recognized video
 * embed, and either uploaded under a ".../images/" bucket folder or carrying
 * an image extension. Keeping both apps' detection identical is what lets
 * the dashboard split "Videos" and "Images" into two sections while still
 * writing every row through the one shared archive-videos endpoint.
 */
export function isDonationArchiveImageUrl(
  url: string | null | undefined
): boolean {
  const raw = url?.trim()
  if (!raw) return false
  if (classifyVideoUrl(raw)?.kind === "embed") return false
  return /\/images\//i.test(raw) || IMAGE_FILE_EXT.test(raw)
}

export function isDonationArchiveImageRow(
  row: Pick<DonationArchiveVideoDto, "videoUrl">
): boolean {
  return isDonationArchiveImageUrl(row.videoUrl)
}

export function isDonationArchiveVideoRow(
  row: Pick<DonationArchiveVideoDto, "videoUrl">
): boolean {
  return !isDonationArchiveImageUrl(row.videoUrl)
}

/**
 * Moves a row up/down within its own kind only, leaving every row of the
 * other kind exactly where it sits.
 *
 * Videos and images share one continuous `displayOrder` sequence (there is no
 * per-kind column to reorder independently), so swapping adjacent positions
 * in the filtered subset the editor sees would — once written back into the
 * full list — also drag along whichever row of the OTHER kind happened to
 * sit between them. Instead this collects the full-array slots the target
 * kind currently occupies, reorders only that subset, and writes it back into
 * those exact slots.
 */
export function moveDonationArchiveRowWithinKind(
  rows: DonationArchiveVideoDto[],
  isTargetKind: (row: DonationArchiveVideoDto) => boolean,
  fromKindIndex: number,
  toKindIndex: number
): DonationArchiveVideoDto[] {
  const slots: number[] = []
  rows.forEach((row, i) => {
    if (isTargetKind(row)) slots.push(i)
  })
  if (fromKindIndex === toKindIndex) return rows
  if (fromKindIndex < 0 || fromKindIndex >= slots.length) return rows
  if (toKindIndex < 0 || toKindIndex >= slots.length) return rows

  const subset = slots.map((i) => rows[i])
  const [moved] = subset.splice(fromKindIndex, 1)
  subset.splice(toKindIndex, 0, moved)

  const next = [...rows]
  slots.forEach((i, idx) => {
    next[i] = subset[idx]
  })
  return next
}
