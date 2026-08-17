import { OPTIMIZABLE_IMAGE_HOSTS } from "@/lib/image-hosts.mjs"

/**
 * Is this string complete enough to store as an image URL?
 *
 * Non-blank is not a good enough test where a URL is typed by hand: the
 * backend only rejects blanks, so a half-finished `htt` would be accepted and
 * render as a broken picture. Mirrors the `optionalUrl` rule the form schemas
 * already use — an absolute http(s) URL, or a same-origin path.
 */
export function isUsableImageUrl(src: string | null | undefined): boolean {
  const s = src?.trim()
  if (!s) return false
  if (s.startsWith("/")) return true
  return /^https?:\/\/\S+$/i.test(s)
}

/**
 * Can `next/image` optimize this source?
 *
 * Components previously hardcoded `unoptimized={src.startsWith("http")}`, which
 * opted every remote image out of the optimizer and made `remotePatterns`
 * decorative. Checking the host instead means images we host get resized and
 * served as WebP, while an arbitrary admin-pasted URL still renders — just
 * unoptimized — rather than failing the optimizer with a 400.
 */
export function isOptimizableImageSrc(src: string | null | undefined): boolean {
  const s = src?.trim()
  if (!s) return false

  // Relative paths (including the same-origin `/railway-proxy` API base) are
  // served by this app and always optimizable.
  if (s.startsWith("/")) return true

  // Local previews of a file the user just picked — nothing to fetch.
  if (s.startsWith("blob:") || s.startsWith("data:")) return false

  try {
    const url = new URL(s)
    if (url.protocol !== "https:") return false
    return OPTIMIZABLE_IMAGE_HOSTS.includes(url.hostname)
  } catch {
    return false
  }
}
