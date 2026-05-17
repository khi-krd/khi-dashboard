"use client"

import { NS } from "@/components/writings/writings-strings"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function WritingInstituteSwitch({
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2">
        <Switch
          id="writing-institute-switch"
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
        <Label
          htmlFor="writing-institute-switch"
          className="cursor-pointer text-sm font-medium"
        >
          {NS.field.institute_label}
        </Label>
      </div>
      <p className="text-muted-foreground text-xs">{NS.field.institute_helper}</p>
    </div>
  )
}
