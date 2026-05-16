"use client"

import { NS } from "@/components/videos/videos-strings"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function VideoAlbumToggle({
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
              id="album-of-memories"
              checked={checked}
              onCheckedChange={onCheckedChange}
            />
            <Label htmlFor="album-of-memories" className="text-xs font-normal">
              {NS.field.album.label}
            </Label>
          </div>
        }
      />
      <TooltipContent>{NS.field.album.tooltip}</TooltipContent>
    </Tooltip>
  )
}
