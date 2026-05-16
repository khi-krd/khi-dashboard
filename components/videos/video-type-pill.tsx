"use client"

import {
  FilmIcon,
  HeartIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline"

import { NS } from "@/components/videos/videos-strings"
import { cn } from "@/lib/utils"
import type { VideoDto } from "@/types/videos"

export function VideoTypePill({
  videoType,
  albumOfMemories,
  className,
  size = "default",
}: {
  videoType: VideoDto["videoType"]
  albumOfMemories?: boolean
  className?: string
  size?: "default" | "large"
}) {
  const isAlbum =
    videoType === "VIDEO_CLIP" && !!albumOfMemories
  const isClip = videoType === "VIDEO_CLIP" && !albumOfMemories

  let label = NS.type.film
  let Icon = FilmIcon
  let colors =
    "bg-primary/10 text-primary border-primary/20"

  if (isAlbum) {
    label = NS.type.album
    Icon = HeartIcon
    colors =
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
  } else if (isClip) {
    label = NS.type.clip
    Icon = Square2StackIcon
    colors =
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
  }

  return (
    <span
      className={cn(
        "inline-flex w-full items-center justify-center gap-1.5 rounded-md border font-medium",
        size === "large" ? "px-3 py-2 text-sm" : "px-2 py-0.5 text-xs",
        colors,
        className,
      )}
    >
      <Icon className={size === "large" ? "size-5" : "size-3.5"} aria-hidden />
      {label}
    </span>
  )
}
