"use client"

import {
  Bars2Icon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { VideoPlayerBlock } from "@/components/videos/video-player-block"
import { NS } from "@/components/videos/videos-strings"
import { formatDuration, formatFileSizeMb } from "@/lib/video-format"
import { formatEnDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { VideoFormValues } from "@/lib/validations/videos"

type Source = VideoFormValues["videoSources"][number]

export function VideoSourceCard({
  id,
  index,
  source,
  onEdit,
  onRemove,
}: {
  id: string
  index: number
  source: Source
  onEdit: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const label = source.label?.trim() || NS.source.no_label
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  useEffect(() => {
    const staged = source.stagedVideoFile
    if (!staged) {
      setLocalPreview(null)
      return
    }
    const u = URL.createObjectURL(staged)
    setLocalPreview(u)
    return () => URL.revokeObjectURL(u)
  }, [source.stagedVideoFile])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-border group flex gap-3 rounded-lg border p-3"
    >
      <div className="w-32 shrink-0">
        <VideoPlayerBlock
          className="!aspect-video !rounded-md"
          source={{
            url: localPreview || source.url,
            externalUrl: source.externalUrl,
            embedUrl: source.embedUrl,
            fileFormat: source.fileFormat,
          }}
        />
      </div>
      <button
        type="button"
        className="min-w-0 flex-1 text-start"
        onClick={onEdit}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-primary text-xs font-mono">
            #{formatEnDigits(index + 1)}
          </p>
          {source.main ? (
            <Badge variant="secondary" className="text-[10px]">
              {NS.source.main_badge}
            </Badge>
          ) : null}
        </div>
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground mt-1 font-mono text-[10px]">
          {formatDuration(source.durationSeconds ?? null)} ·{" "}
          {source.resolution || NS.dash} ·{" "}
          {(source.fileFormat ?? "").toUpperCase() || NS.dash} ·{" "}
          {source.fileSizeMb != null
            ? formatFileSizeMb(source.fileSizeMb)
            : NS.dash}
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
          className={cn(
            "text-muted-foreground cursor-grab rounded p-1",
          )}
          {...attributes}
          {...listeners}
        >
          <Bars2Icon className="size-4" />
        </button>
      </div>
    </div>
  )
}
