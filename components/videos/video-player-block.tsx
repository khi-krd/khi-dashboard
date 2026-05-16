"use client"

import { PlayIcon } from "@heroicons/react/24/solid"
import Image from "next/image"
import Link from "next/link"

import { NS } from "@/components/videos/videos-strings"
import {
  detectProvider,
  mimeFromFormat,
  providerLabel,
} from "@/lib/video-url-helpers"
import { cn } from "@/lib/utils"

export type VideoSourceFields = {
  url?: string | null
  externalUrl?: string | null
  embedUrl?: string | null
  fileFormat?: string | null
}

export function VideoPlayerBlock({
  source,
  poster,
  className,
}: {
  source: VideoSourceFields
  poster?: string | null
  className?: string
}) {
  const embed = source.embedUrl?.trim()
  const file = source.url?.trim()
  const external = source.externalUrl?.trim()
  const posterUrl = poster?.trim()

  if (embed) {
    return (
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-xl bg-black",
          className,
        )}
      >
        <iframe
          src={embed}
          title="video"
          className="absolute inset-0 size-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />
      </div>
    )
  }

  if (file) {
    return (
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-xl bg-black",
          className,
        )}
      >
        <video
          controls
          poster={posterUrl || undefined}
          className="size-full"
          preload="metadata"
        >
          <source src={file} type={mimeFromFormat(source.fileFormat)} />
        </video>
      </div>
    )
  }

  if (external) {
    const provider = detectProvider(external)
    return (
      <div className={cn("space-y-2", className)}>
        <Link
          href={external}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-video overflow-hidden rounded-xl bg-black"
        >
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt=""
              fill
              className="object-cover opacity-90 transition-opacity group-hover:opacity-75"
              unoptimized={posterUrl.startsWith("http")}
            />
          ) : (
            <div className="bg-muted size-full" />
          )}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background/90 flex size-16 items-center justify-center rounded-full shadow-lg">
              <PlayIcon className="text-foreground size-8" />
            </span>
          </span>
        </Link>
        <p className="text-muted-foreground text-xs">
          {NS.source.opens_in(providerLabel(provider))}
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-muted flex aspect-video items-center justify-center rounded-xl",
        className,
      )}
    >
      <span className="text-muted-foreground text-sm">{NS.dash}</span>
    </div>
  )
}
