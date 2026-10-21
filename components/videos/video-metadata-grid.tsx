"use client"

import { NS } from "@/components/videos/videos-strings"
import { Label } from "@/components/ui/label"
import { formatDuration } from "@/lib/video-format"

function MetaValue({ children }: { children: React.ReactNode }) {
  return (
    <p className="bg-muted/50 flex h-8 items-center rounded-md px-2 font-mono text-xs">
      {children ?? "—"}
    </p>
  )
}

/**
 * Read-only technical metadata. Values are calculated automatically — from the
 * staged file in the browser, then re-verified server-side with ffprobe on
 * upload — so the editor only ever displays them.
 */
export function VideoMetadataGrid({
  durationSeconds,
  resolution,
  fileFormat,
  fileSizeMb,
}: {
  durationSeconds: number | null | undefined
  resolution: string
  fileFormat: string
  fileSizeMb: number | null | undefined
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {NS.section.technical}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.duration}</Label>
          <MetaValue>{formatDuration(durationSeconds ?? null)}</MetaValue>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.resolution}</Label>
          <MetaValue>{resolution || null}</MetaValue>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.format}</Label>
          <MetaValue>{fileFormat || null}</MetaValue>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.size}</Label>
          <MetaValue>
            {fileSizeMb != null ? `${fileSizeMb} ${NS.field.size_unit}` : null}
          </MetaValue>
        </div>
      </div>
    </div>
  )
}
