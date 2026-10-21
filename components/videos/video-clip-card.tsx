"use client"

import {
  Bars2Icon,
  PencilSquareIcon,
  StarIcon as StarIconOutline,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEffect, useState } from "react"

import { useObjectUrl } from "@/hooks/use-object-url"
import { VideoPlayerBlock } from "@/components/videos/video-player-block"
import { NS } from "@/components/videos/videos-strings"
import { formatDuration, formatFileSizeMb } from "@/lib/video-format"
import { cn } from "@/lib/utils"
import type { VideoFormValues } from "@/lib/validations/videos"

type Clip = VideoFormValues["videoClipItems"][number]

export function VideoClipCard({
  id,
  clip,
  onEdit,
  onRemove,
  onSetMain,
}: {
  id: string
  clip: Clip
  onEdit: () => void
  onRemove: () => void
  onSetMain: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const title = clip.titleCkb?.trim() || clip.titleKmr?.trim() || NS.clip.no_title
  const localPreview = useObjectUrl(clip.stagedVideoFile)


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
            url: localPreview || clip.url,
            externalUrl: clip.externalUrl,
            embedUrl: clip.embedUrl,
            fileFormat: clip.fileFormat,
          }}
        />
      </div>
      <button
        type="button"
        className="min-w-0 flex-1 text-start"
        onClick={onEdit}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-primary text-xs font-mono">#{clip.clipNumber}</p>
          {clip.main ? (
            <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium">
              <StarIconSolid className="size-3" />
              {NS.clip.main_badge}
            </span>
          ) : null}
        </div>
        <p className="font-medium">{title}</p>
        {clip.titleKmr && clip.titleCkb ? (
          <p className="text-muted-foreground text-xs">{clip.titleKmr}</p>
        ) : null}
        <p className="text-muted-foreground mt-1 font-mono text-[10px]">
          {formatDuration(clip.durationSeconds ?? null)} ·{" "}
          {clip.resolution || NS.dash} ·{" "}
          {(clip.fileFormat ?? "").toUpperCase() || NS.dash} ·{" "}
          {clip.fileSizeMb != null
            ? formatFileSizeMb(clip.fileSizeMb)
            : NS.dash}
        </p>
      </button>
      <div className="flex shrink-0 flex-col gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
        <button
          type="button"
          title={NS.clip.set_main}
          aria-label={NS.clip.set_main}
          aria-pressed={!!clip.main}
          className={cn(
            "rounded p-1",
            clip.main
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={onSetMain}
        >
          {clip.main ? (
            <StarIconSolid className="size-4" />
          ) : (
            <StarIconOutline className="size-4" />
          )}
        </button>
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
