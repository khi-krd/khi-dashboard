"use client"

import { useEffect } from "react"
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid"

import { formatDuration } from "@/lib/sound-format"
import { cn } from "@/lib/utils"
import { useSoundPlayer } from "@/store/sound-player.store"
import type { SoundFileDto } from "@/types/sounds"

export function SoundPlayerBar({
  trackId,
  file,
  title,
  subtitle,
  className,
}: {
  trackId: number
  file: SoundFileDto | null
  title: string
  subtitle?: string
  className?: string
}) {
  const src =
    file?.fileUrl?.trim() || file?.externalUrl?.trim() || file?.embedUrl?.trim() || ""
  const current = useSoundPlayer((s) => s.current)
  const isPlaying = useSoundPlayer((s) => s.isPlaying)
  const currentTime = useSoundPlayer((s) => s.currentTime)
  const duration = useSoundPlayer((s) => s.duration)
  const play = useSoundPlayer((s) => s.play)
  const toggle = useSoundPlayer((s) => s.toggle)
  const seek = useSoundPlayer((s) => s.seek)

  const isActive =
    current?.trackId === trackId && current?.fileId === file?.id && current?.src === src

  const displayTime = isActive ? currentTime : 0
  const displayDuration =
    isActive && duration > 0
      ? duration
      : file?.durationSeconds ?? 0

  useEffect(() => {
    if (!src || !file) return
    if (isActive && isPlaying) return
  }, [file, isActive, isPlaying, src])

  function handlePlay() {
    if (!src) return
    if (isActive) {
      toggle()
      return
    }
    play({
      trackId,
      fileId: file?.id,
      src,
      title,
      subtitle,
    })
  }

  const progress =
    displayDuration > 0 ? (displayTime / displayDuration) * 100 : 0

  return (
    <div
      className={cn(
        "border-border bg-card flex flex-col gap-3 rounded-xl border p-4",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={!src}
          onClick={handlePlay}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex size-12 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
        >
          {isActive && isPlaying ? (
            <PauseIcon className="size-6" />
          ) : (
            <PlayIcon className="size-6" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{title}</p>
          {subtitle ? (
            <p className="text-muted-foreground truncate text-sm">{subtitle}</p>
          ) : null}
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            {formatDuration(displayTime)} / {formatDuration(displayDuration)}
          </p>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={displayDuration || 100}
        value={isActive ? displayTime : 0}
        disabled={!src || !isActive}
        onChange={(e) => seek(Number(e.target.value))}
        className="accent-primary h-1.5 w-full"
      />
      <div
        className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
        aria-hidden
      >
        <div
          className="bg-primary h-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
