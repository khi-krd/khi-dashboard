"use client"

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

import { ManagedOptionSegments } from "@/components/shared/managed-option-segments"
import { NS } from "@/components/sounds/sounds-strings"
import type { TrackState } from "@/types/sounds"

/**
 * جۆری تۆماری دەنگ — one managed bar (تاک, ئەلبووم and whatever admins add),
 * exactly one per record. Types are names only: the seeded تاک row opens the
 * single-file editor, every other type the album one.
 */
export function SoundStateToggle({
  value,
  trackState,
  onChange,
  editMode,
}: {
  value: number | null
  trackState: TrackState
  onChange: (id: number | null, trackState: TrackState) => void
  editMode?: boolean
}) {
  return (
    <div className="space-y-2">
      <ManagedOptionSegments
        kind="sound-states"
        required
        value={value}
        fallbackSlug={trackState}
        onChange={(id, option) =>
          onChange(id, option?.slug === "SINGLE" ? "SINGLE" : "MULTI")
        }
        manageHref="/dashboard/taxonomy?tab=sound-states"
      />
      <p className="text-muted-foreground text-xs">{NS.state.toggle.helper}</p>
      {editMode ? (
        <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
          <ExclamationTriangleIcon className="size-4 shrink-0" aria-hidden />
          {NS.state.switch.warning}
        </p>
      ) : null}
    </div>
  )
}
