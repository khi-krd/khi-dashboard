/**
 * The nav-menu PUT is image-only: `imageUrl` replaces the section's background
 * photo and `null`/blank clears it. Nothing else on the row is writable.
 */
export type NavMenuImageWritePayload = {
  imageUrl: string | null
}

export function navMenuImagePayload(imageUrl: string): NavMenuImageWritePayload {
  const trimmed = imageUrl.trim()
  return { imageUrl: trimmed ? trimmed : null }
}
