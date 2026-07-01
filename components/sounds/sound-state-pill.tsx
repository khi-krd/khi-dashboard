"use client"

import {
  HeartIcon,
  MusicalNoteIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline"

import { NS } from "@/components/sounds/sounds-strings"
import { cn } from "@/lib/utils"
import type { TrackState } from "@/types/sounds"

export function SoundStatePill({
  trackState,
  className,
  size = "default",
  albumOfMemoriesFilter = false,
}: {
  trackState: TrackState
  className?: string
  size?: "default" | "large"
  /** When true, show album-of-memories label (server-filtered list rows). */
  albumOfMemoriesFilter?: boolean
}) {
  const isMulti = trackState === "MULTI"

  let label: string = NS.state.single
  let Icon = MusicalNoteIcon
  let colors = "bg-primary/10 text-primary border-primary/20"

  if (albumOfMemoriesFilter) {
    label = NS.state.album_of_memories
    Icon = HeartIcon
    colors =
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
  } else if (isMulti) {
    label = NS.state.multi
    Icon = RectangleStackIcon
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
