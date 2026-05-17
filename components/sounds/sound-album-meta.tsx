"use client"

import { NS } from "@/components/sounds/sounds-strings"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { TrackState } from "@/types/sounds"

export function SoundAlbumMeta({
  trackState,
  albumOfMemories,
  albumName,
  publishmentYear,
  cdNumber,
  totalTracks,
  onAlbumOfMemoriesChange,
  onAlbumNameChange,
  onPublishmentYearChange,
  onCdNumberChange,
  onTotalTracksChange,
  albumOfMemoriesError,
}: {
  trackState: TrackState
  albumOfMemories: boolean
  albumName: string
  publishmentYear: number | null | undefined
  cdNumber: number | null | undefined
  totalTracks: number | null | undefined
  onAlbumOfMemoriesChange: (v: boolean) => void
  onAlbumNameChange: (s: string) => void
  onPublishmentYearChange: (n: number | null) => void
  onCdNumberChange: (n: number | null) => void
  onTotalTracksChange: (n: number | null) => void
  albumOfMemoriesError?: string
}) {
  if (trackState !== "MULTI") return null

  return (
    <section className="space-y-4">
      <Label className="text-muted-foreground text-xs uppercase">{NS.section.album_info}</Label>
      <Tooltip>
        <TooltipTrigger
          render={
            <div className="flex items-center gap-2">
              <Switch
                id="sound-album-memories"
                checked={albumOfMemories}
                onCheckedChange={onAlbumOfMemoriesChange}
              />
              <Label htmlFor="sound-album-memories" className="text-xs font-normal">
                {NS.state.album_of_memories}
              </Label>
            </div>
          }
        />
        <TooltipContent>{NS.state.album_of_memories}</TooltipContent>
      </Tooltip>
      <FieldError>{albumOfMemoriesError}</FieldError>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">{NS.field.album_name_placeholder}</Label>
          <Input
            value={albumName}
            onChange={(e) => onAlbumNameChange(e.target.value)}
            placeholder={NS.field.album_name_placeholder}
            className="h-9"
            maxLength={300}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">{NS.field.publishment_year}</Label>
            <Input
              type="number"
              min={1900}
              max={2100}
              className="h-9"
              value={publishmentYear ?? ""}
              onChange={(e) => {
                const v = e.target.value
                onPublishmentYearChange(v === "" ? null : Number(v))
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{NS.field.cd_number}</Label>
            <Input
              type="number"
              min={1}
              className="h-9"
              value={cdNumber ?? ""}
              onChange={(e) => {
                const v = e.target.value
                onCdNumberChange(v === "" ? null : Number(v))
              }}
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">{NS.field.total_tracks}</Label>
            <Input
              type="number"
              min={1}
              className="h-9"
              value={totalTracks ?? ""}
              onChange={(e) => {
                const v = e.target.value
                onTotalTracksChange(v === "" ? null : Number(v))
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
