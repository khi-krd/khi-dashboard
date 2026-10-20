"use client"

import { NS } from "@/components/sounds/sounds-strings"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * ئەلبوومی بیرەوەرییەکان flag — mirrors the video clip-list toggle. Only
 * rendered when trackState is MULTI (a single track can't be a memories
 * album), and the payload forces it false on SINGLE.
 */
export function SoundAlbumToggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div className="flex items-center gap-2">
            <Switch
              id="sound-album-of-memories"
              checked={checked}
              onCheckedChange={onCheckedChange}
            />
            <Label
              htmlFor="sound-album-of-memories"
              className="text-xs font-normal"
            >
              {NS.field.album.label}
            </Label>
          </div>
        }
      />
      <TooltipContent>{NS.field.album.tooltip}</TooltipContent>
    </Tooltip>
  )
}
