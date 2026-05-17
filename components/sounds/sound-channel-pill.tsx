"use client"

import { cn } from "@/lib/utils"
import { audioChannelLabel } from "@/lib/sound-format"
import type { AudioChannel } from "@/types/sounds"

export function SoundChannelPill({
  channel,
  className,
}: {
  channel: AudioChannel | null | undefined
  className?: string
}) {
  const label = audioChannelLabel(channel)
  if (label === "—") return null
  return (
    <span
      className={cn(
        "border-border bg-muted text-muted-foreground inline-flex rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase",
        className,
      )}
    >
      {label}
    </span>
  )
}
