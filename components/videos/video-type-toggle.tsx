"use client"

import { ExclamationTriangleIcon, FilmIcon } from "@heroicons/react/24/outline"
import { Square2StackIcon } from "@heroicons/react/24/outline"

import { NS } from "@/components/videos/videos-strings"
import { cn } from "@/lib/utils"
import type { VideoType } from "@/types/videos"

export function VideoTypeToggle({
  value,
  onChange,
  editMode,
}: {
  value: VideoType
  onChange: (v: VideoType) => void
  editMode?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="bg-muted/50 inline-flex rounded-lg p-1">
        <button
          type="button"
          onClick={() => onChange("FILM")}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            value === "FILM"
              ? "bg-primary/10 text-primary border-primary/20 border shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <FilmIcon className="size-4" aria-hidden />
          {NS.type.film}
        </button>
        <button
          type="button"
          onClick={() => onChange("VIDEO_CLIP")}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            value === "VIDEO_CLIP"
              ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Square2StackIcon className="size-4" aria-hidden />
          {NS.type.clip}
        </button>
      </div>
      <p className="text-muted-foreground text-xs">{NS.type.toggle.helper}</p>
      {editMode ? (
        <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
          <ExclamationTriangleIcon className="size-4 shrink-0" aria-hidden />
          {NS.type.switch.warning}
        </p>
      ) : null}
    </div>
  )
}
