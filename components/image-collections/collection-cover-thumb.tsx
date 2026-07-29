"use client"

import {
  BookOpenIcon,
  PhotoIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import { useState } from "react"

import { isOptimizableImageSrc } from "@/lib/image-src"
import { cn } from "@/lib/utils"
import type { CollectionDto, CollectionType } from "@/types/image-collections"

/**
 * Renders the icon directly instead of handing back a component reference for
 * the caller to mount. The previous shape — a `TypeIcon()` helper called like a
 * function, then rendered through a local `const Icon` — gave the element a
 * component identity that only existed inside the render body, which is what
 * `react-hooks/static-components` objects to.
 */
function CollectionTypeIcon({
  type,
  className,
}: {
  type: CollectionType
  className?: string
}) {
  if (type === "SINGLE") return <PhotoIcon className={className} aria-hidden />
  if (type === "PHOTO_STORY")
    return <BookOpenIcon className={className} aria-hidden />
  return <Squares2X2Icon className={className} aria-hidden />
}

export function CollectionCoverThumb({
  collection,
  className,
}: {
  collection: Pick<
    CollectionDto,
    "ckbCoverUrl" | "hoverCoverUrl" | "collectionType"
  >
  className?: string
}) {
  const [hovered, setHovered] = useState(false)
  const base = collection.ckbCoverUrl?.trim()
  const hover = collection.hoverCoverUrl?.trim()
  const showHover = hovered && hover

  if (!base && !hover) {
    return (
      <div
        className={cn(
          "bg-muted text-muted-foreground/50 relative flex size-12 items-center justify-center rounded-md",
          className,
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <CollectionTypeIcon
          type={collection.collectionType}
          className="size-4"
        />
      </div>
    )
  }

  const src = showHover ? hover! : base || hover!

  return (
    <div
      className={cn(
        "bg-muted relative size-12 shrink-0 overflow-hidden rounded-md",
        className,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover transition-opacity duration-300"
        unoptimized={!isOptimizableImageSrc(src)}
      />
    </div>
  )
}
