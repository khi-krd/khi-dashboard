"use client"

import {
  PhotoIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline"

import { NS } from "@/components/services/services-strings"
import { cn } from "@/lib/utils"
import type { ServiceMediaType } from "@/types/services"

export function mediaTypeLabel(type: ServiceMediaType): string {
  switch (type) {
    case "IMAGE":
      return NS.collection.mediaTypeImage
    case "VIDEO":
      return NS.collection.mediaTypeVideo
    case "AUDIO":
      return NS.collection.mediaTypeAudio
  }
}

export function ServiceMediaTypeBadge({
  type,
  className,
}: {
  type: ServiceMediaType
  className?: string
}) {
  const Icon =
    type === "IMAGE"
      ? PhotoIcon
      : type === "VIDEO"
        ? VideoCameraIcon
        : SpeakerWaveIcon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
        type === "IMAGE" &&
          "border-primary/20 bg-primary/10 text-primary",
        type === "VIDEO" &&
          "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
        type === "AUDIO" &&
          "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400",
        className,
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {mediaTypeLabel(type)}
    </span>
  )
}

export function fileMetadataBadge(
  file: {
    fileFormat?: string | null
    resolution?: string | null
    formattedDuration?: string | null
    widthPx?: number | null
    heightPx?: number | null
  },
  mediaType: ServiceMediaType,
): string | null {
  const fmt = file.fileFormat?.trim()
  if (mediaType === "IMAGE") {
    const res =
      file.resolution?.trim() ||
      (file.widthPx && file.heightPx
        ? `${file.widthPx}×${file.heightPx}`
        : null)
    if (fmt && res) return `${fmt} · ${res}`
    return fmt || res
  }
  const dur = file.formattedDuration?.trim()
  if (fmt && dur) return `${fmt} · ${dur}`
  return fmt || dur || null
}
