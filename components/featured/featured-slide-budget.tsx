"use client"

import { useMemo } from "react"

import { FeaturedCategoryIcon } from "@/components/featured/featured-category-icon"
import { NS } from "@/components/featured/featured-strings"
import { Badge } from "@/components/ui/badge"
import { useMaxFeaturedSlides } from "@/hooks/useSiteSettings"
import {
  countsTowardSlideCap,
  FEATURED_CATEGORY_LABELS,
  type FeaturedCatalogItem,
} from "@/lib/featured-catalog"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"

/**
 * The carousel budget, counted from the pooled featured list:
 *
 *   used = news + projects + writings + videos + sounds + collections
 *        + (donation ? 1 : 0)
 *
 * Services and About are excluded on purpose — their flag highlights them on
 * their own page and never reaches the carousel, so charging them here would
 * report slots as taken that the carousel could still use. The donation page
 * contributes at most one, being a settings singleton.
 */
export function FeaturedSlideBudget({
  items,
  max: maxOverride,
}: {
  items: FeaturedCatalogItem[]
  max?: number
}) {
  // The cap is a stored setting, editable on the Branding screen, so it is read
  // live rather than assumed. The hook falls back to the documented default
  // while the request is in flight.
  const liveMax = useMaxFeaturedSlides()
  const max = maxOverride ?? liveMax

  const { used, remaining, breakdown } = useMemo(() => {
    const featured = items.filter(
      (item) => item.featured && countsTowardSlideCap(item),
    )
    const counts = new Map<FeaturedCatalogItem["category"], number>()
    for (const item of featured) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
    }
    return {
      used: featured.length,
      remaining: Math.max(0, max - featured.length),
      breakdown: [...counts.entries()].sort((a, b) => b[1] - a[1]),
    }
  }, [items, max])

  const isFull = used >= max
  // Over the cap is reachable: the limit lives in the database and can be
  // lowered under a set of already-featured records.
  const isOver = used > max
  const filled = Math.min(used, max)

  return (
    <section
      className={cn(
        "rounded-xl border p-4",
        isOver
          ? "border-destructive/40 bg-destructive/5"
          : isFull
            ? "border-amber-500/40 bg-amber-500/5"
            : "border-border bg-card",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-medium">{NS.budget.label}</h3>
          <span className="text-muted-foreground text-xs">{NS.budget.hint}</span>
        </div>
        <p
          className={cn(
            "font-mono text-sm font-semibold tabular-nums",
            isOver
              ? "text-destructive"
              : isFull
                ? "text-amber-600 dark:text-amber-400"
                : "text-foreground",
          )}
        >
          {NS.budget.used(formatCkbDigits(used), formatCkbDigits(max))}
        </p>
      </div>

      {/* One pip per slot reads as "seats", which is what the cap actually is. */}
      <div
        className="mt-3 flex gap-1"
        role="img"
        aria-label={NS.budget.used(
          formatCkbDigits(used),
          formatCkbDigits(max),
        )}
      >
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < filled
                ? isOver
                  ? "bg-destructive"
                  : isFull
                    ? "bg-amber-500"
                    : "bg-primary"
                : "bg-muted",
            )}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p
          className={cn(
            "text-xs",
            isFull ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
          )}
        >
          {isFull
            ? NS.budget.full
            : NS.budget.remaining(formatCkbDigits(remaining))}
        </p>
        {breakdown.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {breakdown.map(([category, count]) => (
              <Badge
                key={category}
                variant="secondary"
                className="gap-1 font-normal"
              >
                <FeaturedCategoryIcon category={category} className="size-3" />
                {FEATURED_CATEGORY_LABELS[category]}
                <span className="font-mono tabular-nums">
                  {formatCkbDigits(count)}
                </span>
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
