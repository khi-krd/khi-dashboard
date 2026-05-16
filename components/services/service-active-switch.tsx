"use client"

import { NS } from "@/components/services/services-strings"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function ServiceActiveSwitch({
  checked,
  onCheckedChange,
  disabled,
  showLabel = true,
  className,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
  showLabel?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Switch
        id="service-active-switch"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      {showLabel ? (
        <Label
          htmlFor="service-active-switch"
          className="text-muted-foreground cursor-pointer text-xs font-normal"
        >
          {NS.active.label}
        </Label>
      ) : null}
    </div>
  )
}
