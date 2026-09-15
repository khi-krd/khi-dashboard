"use client"

import { formatEnDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"

/**
 * Thin upload progress line shown while a file/multipart request streams to
 * the API. `value` is a 0–100 percentage; `null`/`undefined` renders nothing.
 * The track is forced LTR so the fill direction stays consistent in RTL forms.
 */
export function UploadProgressLine({
  value,
  label,
  compact = false,
  className,
}: {
  value: number | null | undefined
  label?: string
  /** Just the fill bar — no label/percent row underneath. */
  compact?: boolean
  className?: string
}) {
  if (value == null) return null
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={cn("w-full", className)}>
      <div
        dir="ltr"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        className={cn(
          "bg-primary/15 w-full overflow-hidden rounded-full",
          compact ? "h-0.5" : "h-1",
        )}
      >
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-200 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {compact ? null : (
        <div className="text-muted-foreground mt-1 flex items-center justify-between gap-2 text-[11px] leading-none tabular-nums">
          {label ? <span className="truncate">{label}</span> : <span />}
          <span dir="ltr">{formatEnDigits(Math.round(pct))}%</span>
        </div>
      )}
    </div>
  )
}
