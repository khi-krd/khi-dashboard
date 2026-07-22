"use client"

import {
  CodeBracketIcon,
  DocumentIcon,
  PlayCircleIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline"

import { NS } from "@/components/videos/videos-strings"
import { isVimeoUrl, isYoutubeUrl } from "@/lib/video-url-helpers"
import { cn } from "@/lib/utils"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { VideoDto } from "@/types/videos"
import { getFilmSourceCount } from "@/types/videos-ui"

export function VideoSourcePill({
  video,
  className,
}: {
  video: Pick<
    VideoDto,
    | "videoType"
    | "sourceUrl"
    | "sourceExternalUrl"
    | "sourceEmbedUrl"
    | "videoSources"
    | "videoClipItems"
  >
  className?: string
}) {
  if (video.videoType === "VIDEO_CLIP") {
    const count = video.videoClipItems?.length ?? 0
    return (
      <span
        className={cn(
          "bg-muted text-foreground inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-0.5 text-xs font-medium",
          className,
        )}
      >
        <Square2StackIcon className="size-3.5" aria-hidden />
        {NS.source.clip_count(String(count))}
      </span>
    )
  }

  const sourceCount = getFilmSourceCount(video)
  if (sourceCount > 1) {
    return (
      <span
        className={cn(
          "bg-muted text-foreground inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-0.5 text-xs font-medium",
          className,
        )}
      >
        <Square2StackIcon className="size-3.5" aria-hidden />
        {NS.source.part_count(formatCkbDigits(sourceCount))}
      </span>
    )
  }

  const sources = video.videoSources ?? []
  const main = sources.find((s) => s.main) ?? sources[0]
  const fileUrl = main?.url?.trim() || video.sourceUrl?.trim()

  if (fileUrl) {
    return (
      <span
        className={cn(
          "bg-muted text-foreground inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-0.5 text-xs font-medium",
          className,
        )}
      >
        <DocumentIcon className="size-3.5" aria-hidden />
        {NS.source.file}
      </span>
    )
  }

  const embedUrl = main?.embedUrl?.trim() || video.sourceEmbedUrl?.trim()
  const ext = main?.externalUrl?.trim() || video.sourceExternalUrl?.trim() || ""

  if (ext && isYoutubeUrl(ext)) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
          "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
          className,
        )}
      >
        <PlayCircleIcon className="size-3.5" aria-hidden />
        {NS.source.youtube}
      </span>
    )
  }

  if (ext && isVimeoUrl(ext)) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
          "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
          className,
        )}
      >
        <PlayCircleIcon className="size-3.5" aria-hidden />
        {NS.source.vimeo}
      </span>
    )
  }

  if (embedUrl) {
    return (
      <span
        className={cn(
          "bg-muted text-foreground border-border inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
          className,
        )}
      >
        <CodeBracketIcon className="size-3.5" aria-hidden />
        {NS.source.embed}
      </span>
    )
  }

  return (
    <span className={cn("text-muted-foreground/60 text-xs", className)}>
      {NS.dash}
    </span>
  )
}
