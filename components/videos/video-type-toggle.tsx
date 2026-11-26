"use client"

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

import { ManagedOptionSegments } from "@/components/shared/managed-option-segments"
import { NS } from "@/components/videos/videos-strings"
import type { VideoType } from "@/types/videos"

/**
 * جۆری ڤیدیۆ — one managed bar (فیلم, ڤیدیۆ کلیپ and whatever admins add),
 * exactly one per record. Types are names only: the seeded ڤیدیۆ کلیپ row
 * opens the clip-collection editor, every other type the film (parts) one.
 */
export function VideoTypeToggle({
  value,
  videoType,
  onChange,
  editMode,
}: {
  value: number | null
  videoType: VideoType
  onChange: (id: number | null, videoType: VideoType) => void
  editMode?: boolean
}) {
  return (
    <div className="space-y-2">
      <ManagedOptionSegments
        kind="video-categories"
        required
        value={value}
        fallbackSlug={videoType}
        onChange={(id, option) =>
          onChange(id, option?.slug === "VIDEO_CLIP" ? "VIDEO_CLIP" : "FILM")
        }
        manageHref="/dashboard/taxonomy?tab=videos"
      />
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
