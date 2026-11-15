"use client"

import { Switch } from "@/components/ui/switch"
import {
  isPopularId,
  usePopularIds,
  usePopularToggle,
} from "@/hooks/usePopularToggle"
import type { PopularEntity } from "@/services/popularService"
import { cn } from "@/lib/utils"

export const POPULAR_COL_LABEL = "ناوەڕۆکی باو"
const LABEL = POPULAR_COL_LABEL
const HINT = "لە بەشی باوترینەکانی سەرەتاێکدا پێشینەی هەیە"

/**
 * Per-row homepage-popular switch for entity data grids. Reads the shared
 * popular-id cache (one query feeds every row) and toggles through
 * `PATCH /api/v1/popular/{entity}/{id}`.
 */
export function PopularCell({
  entity,
  id,
  className,
}: {
  entity: PopularEntity
  id: number | null | undefined
  className?: string
}) {
  const { data: popularIds } = usePopularIds()
  const toggle = usePopularToggle()

  if (id == null) {
    return null
  }

  const checked = isPopularId(popularIds, entity, id)

  return (
    <span
      className={cn("flex items-center gap-1.5", className)}
      title={HINT}
      onClick={(e) => e.stopPropagation()}
    >
      <Switch
        size="sm"
        checked={checked}
        disabled={toggle.isPending}
        onCheckedChange={(next) =>
          toggle.mutate({ entity, id, isPopular: next })
        }
        aria-label={LABEL}
      />
      <span
        className={cn(
          "hidden text-xs xl:inline",
          checked ? "text-primary font-medium" : "text-muted-foreground",
        )}
      >
        {LABEL}
      </span>
    </span>
  )
}
