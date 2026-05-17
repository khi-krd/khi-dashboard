"use client"

import {
  ExclamationTriangleIcon,
  MusicalNoteIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline"

import { NS } from "@/components/sounds/sounds-strings"
import { cn } from "@/lib/utils"
import type { TrackState } from "@/types/sounds"

export function SoundStateToggle({
  value,
  onChange,
  editMode,
}: {
  value: TrackState
  onChange: (v: TrackState) => void
  editMode?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="bg-muted/50 inline-flex rounded-lg p-1">
        <button
          type="button"
          onClick={() => onChange("SINGLE")}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            value === "SINGLE"
              ? "border-primary/20 bg-primary/10 text-primary border shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <MusicalNoteIcon className="size-4" aria-hidden />
          {NS.state.single}
        </button>
        <button
          type="button"
          onClick={() => onChange("MULTI")}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            value === "MULTI"
              ? "border-blue-500/20 bg-blue-500/10 text-blue-700 shadow-sm border dark:text-blue-400"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <QueueListIcon className="size-4" aria-hidden />
          {NS.state.multi}
        </button>
      </div>
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
