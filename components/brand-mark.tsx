import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * The KHI institute mark. Sourced from `public/khi-logo.png` — a local asset,
 * so `next/image` optimizes and serves it as WebP without any `remotePatterns`
 * involvement.
 *
 * The logo is a circular badge with its own background, so it needs no coloured
 * tile behind it — unlike the generic glyph placeholders it replaces.
 */
export function BrandMark({
  size = 32,
  className,
  priority = false,
}: {
  size?: number
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src="/khi-logo.png"
      alt="KHI"
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 rounded-full object-contain", className)}
    />
  )
}
