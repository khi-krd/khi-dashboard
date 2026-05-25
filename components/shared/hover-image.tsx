import { cn } from "@/lib/utils"

export type HoverImageProps = {
  /** Base (resting) image URL. */
  src?: string | null
  /** Optional image shown on hover. Crossfades in via CSS — no React state. */
  hoverSrc?: string | null
  alt?: string
  /** Extra classes merged onto each `<img>`. */
  className?: string
  /** Rendered when `src` is empty (e.g. a placeholder icon). */
  fallback?: React.ReactNode
}

const imgBase = "absolute inset-0 h-full w-full object-cover"

/**
 * Cover image with an optional hover variant. The hover swap is pure CSS
 * (`group-hover` opacity crossfade), so hovering never triggers a React
 * re-render. Requires a `group` ancestor (the card already provides one).
 * Both images use native lazy loading + async decoding.
 */
export function HoverImage({
  src,
  hoverSrc,
  alt = "",
  className,
  fallback,
}: HoverImageProps) {
  if (!src) return <>{fallback ?? null}</>

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          imgBase,
          hoverSrc && "transition-opacity duration-300 group-hover:opacity-0",
          className,
        )}
      />
      {hoverSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hoverSrc}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className={cn(
            imgBase,
            "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            className,
          )}
        />
      ) : null}
    </>
  )
}
