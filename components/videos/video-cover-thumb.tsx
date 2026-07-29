"use client"

import { FilmIcon, Square2StackIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import { useState } from "react"

import { isOptimizableImageSrc } from "@/lib/image-src"
import { cn } from "@/lib/utils"
import type { VideoDto } from "@/types/videos"

export function VideoCoverThumb({
  video,
  className,
}: {
  video: Pick<
    VideoDto,
    "ckbCoverUrl" | "kmrCoverUrl" | "hoverCoverUrl" | "videoType"
  >
  className?: string
}) {
  const [hovered, setHovered] = useState(false)
  const base = video.ckbCoverUrl?.trim() || video.kmrCoverUrl?.trim()
  const hover = video.hoverCoverUrl?.trim()
  const showHover = hovered && hover

  if (!base && !hover) {
    const Icon =
      video.videoType === "FILM" ? FilmIcon : Square2StackIcon
    return (
      <div
        className={cn(
          "bg-muted text-muted-foreground/50 flex h-10 w-14 items-center justify-center rounded-md",
          className,
        )}
      >
        <Icon className="size-4" aria-hidden />
      </div>
    )
  }

  const src = showHover ? hover! : base || hover!

  return (
    <div
      className={cn(
        "bg-muted relative h-10 w-14 shrink-0 overflow-hidden rounded-md",
        className,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={src}
        alt=""
        fill
        className={cn(
          "object-cover transition-opacity duration-300",
          showHover ? "opacity-100" : "opacity-100",
        )}
        unoptimized={!isOptimizableImageSrc(src)}
      />
    </div>
  )
}
