"use client"

import { BookOpenIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import { useState } from "react"

import { isOptimizableImageSrc } from "@/lib/image-src"
import { cn } from "@/lib/utils"
import type { WritingDto } from "@/types/writings"

export function WritingCoverThumb({
  writing,
  className,
}: {
  writing: Pick<WritingDto, "ckbCoverUrl" | "hoverCoverUrl" | "kmrCoverUrl">
  className?: string
}) {
  const [hovered, setHovered] = useState(false)
  const base =
    writing.ckbCoverUrl?.trim() ||
    writing.kmrCoverUrl?.trim() ||
    null
  const hover = writing.hoverCoverUrl?.trim()
  const showHover = hovered && hover
  const src = showHover ? hover! : base || hover

  if (!src) {
    return (
      <div
        className={cn(
          "bg-muted text-muted-foreground/50 relative flex h-12 w-8 shrink-0 items-center justify-center rounded-md",
          className,
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <BookOpenIcon className="size-4" aria-hidden />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-muted relative h-12 w-8 shrink-0 overflow-hidden rounded-md",
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
