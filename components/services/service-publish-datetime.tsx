"use client"

import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocalValue(local: string): string | null {
  if (!local.trim()) return null
  const d = new Date(local)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export function ServicePublishDateTime({
  value,
  onChange,
  className,
}: {
  value: string | null | undefined
  onChange: (iso: string | null) => void
  className?: string
}) {
  const localValue = toDatetimeLocalValue(value)

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        type="datetime-local"
        value={localValue}
        onChange={(e) => onChange(fromDatetimeLocalValue(e.target.value))}
        className="font-mono text-xs"
        dir="ltr"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onChange(new Date().toISOString())}
        >
          {NS.action.publish_now}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onChange(null)}
          >
            {NS.action.clear_publish}
          </Button>
        ) : null}
      </div>
      <p className="text-muted-foreground text-xs">{NS.field.publishHelper}</p>
    </div>
  )
}
