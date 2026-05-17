"use client"

import { NS } from "@/components/about/about-strings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"

export function CompletionBar({
  lang,
  score,
  max = 4,
}: {
  lang: "ckb" | "kmr"
  score: number
  max?: number
}) {
  const pct = (score / max) * 100
  const isFull = score === max
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            lang === "ckb"
              ? "text-primary"
              : "text-blue-700 dark:text-blue-400",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              lang === "ckb" ? "bg-primary" : "bg-blue-500",
            )}
          />
          {lang === "ckb" ? NS.lang.ckb : NS.lang.kmr}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {formatCkbDigits(score)}/{formatCkbDigits(max)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isFull
              ? lang === "ckb"
                ? "bg-primary"
                : "bg-blue-500"
              : "bg-foreground/30",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
