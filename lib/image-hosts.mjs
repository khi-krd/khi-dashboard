/**
 * Hosts the Next image optimizer is allowed to fetch from.
 *
 * Single source of truth: `next.config.mjs` turns this into `images.remotePatterns`,
 * and `lib/image-src.ts` uses it to decide whether a given `src` can be optimized.
 * Those two must agree — an `<Image>` pointed at a host missing from
 * `remotePatterns` fails with a 400 and renders nothing at all.
 *
 * Admins can paste arbitrary image URLs into external-URL fields, so this list
 * will never be exhaustive. That is fine: anything not listed here is rendered
 * with `unoptimized`, which still displays correctly, just without resizing.
 */
export const OPTIMIZABLE_IMAGE_HOSTS = [
  "s3-khiwebsite.s3.us-east-1.amazonaws.com",
  "i.ytimg.com",
  "vumbnail.com",
]
