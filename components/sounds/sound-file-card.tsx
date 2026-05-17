"use client"

import {
  Bars2Icon,
  MusicalNoteIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEffect, useMemo } from "react"

import { NS } from "@/components/sounds/sounds-strings"
import { formatBytes, formatDuration } from "@/lib/sound-format"
import { cn } from "@/lib/utils"
import type { SoundFileFormValues } from "@/lib/validations/sounds"

export function SoundFileCard({
  id,
  index,
  file,
  onEdit,
  onRemove,
}: {
  id: string
  index: number
  file: SoundFileFormValues
  onEdit: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const blobUrl = useMemo(() => {
    if (!file.stagedAudioFile) return null
    return URL.createObjectURL(file.stagedAudioFile)
  }, [file.stagedAudioFile])

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [blobUrl])

  const src =
    blobUrl ||
    file.fileUrl?.trim() ||
    file.externalUrl?.trim() ||
    file.embedUrl?.trim() ||
    ""

  const title = file.title?.trim() || NS.file.no_title
  const hasSource = !!src

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-border group flex gap-3 rounded-lg border p-3"
    >
      <div
        className={cn(
          "bg-muted flex size-14 shrink-0 items-center justify-center rounded-lg",
          hasSource && "ring-primary/30 ring-2",
        )}
      >
        <MusicalNoteIcon className="text-muted-foreground size-6" aria-hidden />
      </div>
      <button type="button" className="min-w-0 flex-1 text-start" onClick={onEdit}>
        <p className="text-primary font-mono text-xs">#{index + 1}</p>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 font-mono text-[10px]">
          {hasSource ? formatDuration(file.durationSeconds) : NS.file.no_source} ·{" "}
          {(file.fileFormat ?? "").toUpperCase() || NS.dash} ·{" "}
          {formatBytes(file.sizeBytes)}
        </p>
      </button>
      <div className="flex shrink-0 flex-col gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground rounded p-1"
          onClick={onEdit}
        >
          <PencilSquareIcon className="size-4" />
        </button>
        <button
          type="button"
          className="text-muted-foreground hover:text-destructive rounded p-1"
          onClick={onRemove}
        >
          <TrashIcon className="size-4" />
        </button>
        <button
          type="button"
          className="text-muted-foreground cursor-grab rounded p-1"
          {...attributes}
          {...listeners}
        >
          <Bars2Icon className="size-4" />
        </button>
      </div>
    </div>
  )
}
