"use client"

import { cn } from "@/lib/utils"
import { formatCkbDigits } from "@/lib/intl-ckb"

export function SeoCountChip({
  value,
  max,
  titleMax,
}: {
  value: number
  max: number
  titleMax?: boolean
}) {
  const amberAt = titleMax ? 50 : 140
  const dangerAt = max

  const className = cn(
    "rounded px-1.5 py-0.5 font-mono text-[10px]",
    value > dangerAt
      ? "bg-destructive/10 text-destructive"
      : value > amberAt
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "bg-muted text-muted-foreground",
  )

  return (
    <span className={className}>
      {formatCkbDigits(value)}/{formatCkbDigits(max)}
    </span>
  )
}
