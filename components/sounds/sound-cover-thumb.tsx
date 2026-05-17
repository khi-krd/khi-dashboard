"use client"

import {
  MusicalNoteIcon,
  PlayIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { useSoundPlayer } from "@/store/sound-player.store"
import type { SoundDto } from "@/types/sounds"

export function SoundCoverThumb({
  sound,
  previewSrc,
  previewTitle,
  className,
  onPreviewPlay,
}: {
  sound: Pick<
    SoundDto,
    "ckbCoverUrl" | "hoverCoverUrl" | "trackState" | "id"
  >
  previewSrc?: string | null
  previewTitle?: string
  className?: string
  onPreviewPlay?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const base = sound.ckbCoverUrl?.trim()
  const hover = sound.hoverCoverUrl?.trim()
  const showHover = hovered && hover
  const canPreview = !!previewSrc?.trim()

  const play = useSoundPlayer((s) => s.play)

  function handlePlayClick(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    if (!previewSrc?.trim() || !sound.id) return
    onPreviewPlay?.()
    play({
      trackId: sound.id,
      src: previewSrc,
      title: previewTitle ?? "",
    })
  }

  if (!base && !hover) {
    const Icon =
      sound.trackState === "SINGLE" ? MusicalNoteIcon : RectangleStackIcon
    return (
      <div
        className={cn(
          "bg-muted text-muted-foreground/50 relative flex size-12 items-center justify-center rounded-md",
          className,
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Icon className="size-4" aria-hidden />
        {canPreview && hovered ? (
          <button
            type="button"
            className="bg-foreground/60 absolute inset-0 flex items-center justify-center rounded-md"
            onClick={handlePlayClick}
          >
            <PlayIcon className="text-background size-4" />
          </button>
        ) : null}
      </div>
    )
  }

  const src = showHover ? hover! : base || hover!

  return (
    <div
      className={cn(
        "bg-muted relative size-12 shrink-0 overflow-hidden rounded-md",
        className,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover transition-opacity duration-300"
        unoptimized={src.startsWith("http")}
      />
      {canPreview && hovered ? (
        <button
          type="button"
          className="bg-foreground/50 absolute inset-0 flex items-center justify-center"
          onClick={handlePlayClick}
        >
          <PlayIcon className="text-background size-5" />
        </button>
      ) : null}
    </div>
  )
}
