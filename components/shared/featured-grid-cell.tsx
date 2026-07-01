"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function FeaturedGridCell({
  id,
  featured,
  featuredOrder,
  onPatch,
  isPending,
  labels,
}: {
  id: number
  featured?: boolean
  featuredOrder?: number | null
  isPending?: boolean
  onPatch: (payload: { featured?: boolean; featuredOrder?: number }) => void
  labels: {
    featured: string
    order: string
    error: string
  }
}) {
  const [orderDraft, setOrderDraft] = useState(
    featuredOrder != null ? String(featuredOrder) : "",
  )

  function handleToggle(checked: boolean) {
    const order =
      featuredOrder ?? (Number.isFinite(Number(orderDraft)) ? Number(orderDraft) : 0)
    onPatch({
      featured: checked,
      featuredOrder: checked ? order : undefined,
    })
  }

  function commitOrder() {
    if (!featured) return
    const n = Number(orderDraft)
    if (!Number.isFinite(n) || n < 0) {
      toast.error(labels.error)
      setOrderDraft(featuredOrder != null ? String(featuredOrder) : "")
      return
    }
    if (n !== featuredOrder) {
      onPatch({ featured: true, featuredOrder: n })
    }
  }

  return (
    <div className={cn("flex items-center gap-2", isPending && "opacity-60")}>
      <Switch
        checked={!!featured}
        disabled={isPending}
        onCheckedChange={handleToggle}
        aria-label={labels.featured}
      />
      {featured ? (
        <Input
          type="number"
          min={0}
          className="h-7 w-14 px-1.5 text-center font-mono text-xs tabular-nums"
          value={orderDraft}
          disabled={isPending}
          onChange={(e) => setOrderDraft(e.target.value)}
          onBlur={commitOrder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur()
            }
          }}
          aria-label={labels.order}
          title={labels.order}
        />
      ) : (
        <span className="text-muted-foreground/50 w-14 text-center text-xs">
          —
        </span>
      )}
    </div>
  )
}
