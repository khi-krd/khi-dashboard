"use client"

import { useEffect, useRef } from "react"
import {
  PauseIcon,
  PlayIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid"

import { NS } from "@/components/sounds/sounds-strings"
import { Button } from "@/components/ui/button"
import { formatDuration } from "@/lib/sound-format"
import { cn } from "@/lib/utils"
import { useSoundPlayer } from "@/store/sound-player.store"

export function SoundPlayerDock() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const current = useSoundPlayer((s) => s.current)
  const isPlaying = useSoundPlayer((s) => s.isPlaying)
  const currentTime = useSoundPlayer((s) => s.currentTime)
  const duration = useSoundPlayer((s) => s.duration)
  const setAudioEl = useSoundPlayer((s) => s.setAudioEl)
  const setCurrentTime = useSoundPlayer((s) => s.setCurrentTime)
  const setDuration = useSoundPlayer((s) => s.setDuration)
  const toggle = useSoundPlayer((s) => s.toggle)
  const seek = useSoundPlayer((s) => s.seek)
  const stop = useSoundPlayer((s) => s.stop)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    setAudioEl(el)
    return () => setAudioEl(null)
  }, [setAudioEl])

  useEffect(() => {
    const el = audioRef.current
    if (!el || !current) return
    if (el.src !== current.src) {
      el.src = current.src
      el.load()
    }
    if (isPlaying) {
      void el.play().catch(() => {})
    }
  }, [current, isPlaying])

  if (!current) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 pb-4">
      <audio
        ref={audioRef}
        className="hidden"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => useSoundPlayer.getState().pause()}
      />
      <div
        dir="rtl"
        className={cn(
          "border-border bg-card pointer-events-auto flex w-full max-w-3xl items-center gap-3 rounded-xl border px-4 py-3 shadow-lg",
        )}
      >
        <Button
          type="button"
          size="icon"
          className="bg-primary text-primary-foreground hover:bg-primary/90 size-10 shrink-0 rounded-full"
          onClick={() => toggle()}
          aria-label={isPlaying ? "pause" : "play"}
        >
          {isPlaying ? (
            <PauseIcon className="size-5" />
          ) : (
            <PlayIcon className="size-5" />
          )}
        </Button>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium">{current.title}</p>
          {current.subtitle ? (
            <p className="text-muted-foreground truncate text-xs">
              {current.subtitle}
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-[10px]">
              {formatDuration(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="accent-primary h-1 min-w-0 flex-1"
              aria-label={NS.player.now_playing}
            />
            <span className="text-muted-foreground font-mono text-[10px]">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          onClick={() => stop()}
          aria-label="close"
        >
          <XMarkIcon className="size-5" />
        </Button>
      </div>
    </div>
  )
}
