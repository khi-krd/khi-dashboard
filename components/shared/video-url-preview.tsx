"use client"

import { VideoCameraIcon } from "@heroicons/react/24/outline"

import { classifyVideoUrl } from "@/lib/video-embed"
import { cn } from "@/lib/utils"

/**
 * Renders a video URL the way it actually plays:
 *  - YouTube/Vimeo/… watch links → provider iframe embed
 *  - direct files (mp4/webm/…) → native <video>
 *  - any other page link → styled card, never a broken player
 */
export function VideoUrlPreview({
  url,
  className,
  poster,
}: {
  url: string
  className?: string
  poster?: string | null
}) {
  const link = classifyVideoUrl(url)

  if (!link || link.kind === "file") {
    return (
      <video
        src={url}
        poster={poster ?? undefined}
        controls
        className={cn("size-full object-cover", className)}
        playsInline
      />
    )
  }

  if (link.kind === "embed") {
    return (
      <iframe
        src={link.src}
        title="video preview"
        className={cn("size-full", className)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  let domain = link.src
  try {
    domain = new URL(
      /^https?:\/\//i.test(link.src) ? link.src : `https://${link.src}`,
    ).hostname
  } catch {
    // show the raw string
  }
  return (
    <a
      href={link.src}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-muted-foreground hover:text-foreground flex size-full flex-col items-center justify-center gap-2 p-6 text-center transition-colors",
        className,
      )}
    >
      <VideoCameraIcon className="size-10 opacity-40" />
      <span dir="ltr" className="max-w-full truncate text-xs">
        {domain}
      </span>
      <span className="text-xs underline">کردنەوە لە سەرچاوەکە</span>
    </a>
  )
}
