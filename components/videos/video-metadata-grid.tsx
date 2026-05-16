"use client"

import { NS } from "@/components/videos/videos-strings"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDuration } from "@/lib/video-format"

const RESOLUTIONS = ["1080p", "720p", "4K", "480p", "2160p"]
const FORMATS = ["mp4", "webm", "mov", "avi", "mkv"]

export function VideoMetadataGrid({
  durationSeconds,
  resolution,
  fileFormat,
  fileSizeMb,
  onDurationChange,
  onResolutionChange,
  onFormatChange,
  onSizeChange,
}: {
  durationSeconds: number | null | undefined
  resolution: string
  fileFormat: string
  fileSizeMb: number | null | undefined
  onDurationChange: (n: number | null) => void
  onResolutionChange: (s: string) => void
  onFormatChange: (s: string) => void
  onSizeChange: (n: number | null) => void
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {NS.section.technical}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.duration}</Label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              className="h-8"
              value={durationSeconds ?? ""}
              onChange={(e) => {
                const v = e.target.value
                onDurationChange(v === "" ? null : Number(v))
              }}
            />
            <span className="text-muted-foreground text-xs">
              {NS.field.duration_unit}
            </span>
          </div>
          <p className="text-muted-foreground font-mono text-[10px]">
            {formatDuration(durationSeconds ?? null)}
          </p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.resolution}</Label>
          <Select
            value={resolution || "__custom"}
            onValueChange={(v) =>
              onResolutionChange(v === "__custom" || v == null ? "" : v)
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={NS.field.resolution} />
            </SelectTrigger>
            <SelectContent>
              {RESOLUTIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
              <SelectItem value="__custom">—</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="mt-1 h-8"
            value={resolution}
            onChange={(e) => onResolutionChange(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.format}</Label>
          <Select
            value={fileFormat || "__custom"}
            onValueChange={(v) =>
              onFormatChange(v === "__custom" || v == null ? "" : v)
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={NS.field.format} />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
              <SelectItem value="__custom">—</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="mt-1 h-8 font-mono text-xs"
            value={fileFormat}
            onChange={(e) => onFormatChange(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.size}</Label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              step={0.1}
              className="h-8"
              value={fileSizeMb ?? ""}
              onChange={(e) => {
                const v = e.target.value
                onSizeChange(v === "" ? null : Number(v))
              }}
            />
            <span className="text-muted-foreground text-xs">
              {NS.field.size_unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
