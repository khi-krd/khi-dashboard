"use client"

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import {
  AddFeaturedDialog,
  type AddFeaturedCandidate,
} from "@/components/featured/add-featured-dialog"
import { FeaturedSortableRow } from "@/components/featured/featured-sortable-row"
import { NS } from "@/components/featured/featured-strings"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  nextFeaturedOrder,
  orderPatches,
  pickFeatured,
  reorderFeaturedIds,
} from "@/lib/featured-utils"
import { toastError } from "@/lib/toast"

type FeaturedPanelProps<T extends { id?: number; featured?: boolean; featuredOrder?: number | null }> = {
  items: T[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  emptyTitle: string
  emptySubtitle: string
  dialogTitle: string
  addLabel: string
  fallbackIcon: React.ReactNode
  coverAspect?: "square" | "book"
  getId: (item: T) => number
  getTitle: (item: T) => string
  getSubtitle: (item: T) => string | null | undefined
  getCoverUrl: (item: T) => string | null | undefined
  detailHref: (id: number) => string
  editHref: (id: number) => string
  onPatch: (
    id: number,
    payload: { featured?: boolean; featuredOrder?: number },
  ) => Promise<void>
}

export function FeaturedPanel<
  T extends { id?: number; featured?: boolean; featuredOrder?: number | null },
>({
  items,
  isLoading,
  isError,
  onRetry,
  emptyTitle,
  emptySubtitle,
  dialogTitle,
  addLabel,
  fallbackIcon,
  coverAspect = "square",
  getId,
  getTitle,
  getSubtitle,
  getCoverUrl,
  detailHref,
  editHref,
  onPatch,
}: FeaturedPanelProps<T>) {
  const featured = useMemo(() => pickFeatured(items), [items])
  const [orderedIds, setOrderedIds] = useState<number[]>([])
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [isReordering, setIsReordering] = useState(false)

  useEffect(() => {
    setOrderedIds(featured.map((item) => getId(item)))
  }, [featured, getId])

  const featuredById = useMemo(() => {
    const map = new Map<number, T>()
    for (const item of featured) {
      map.set(getId(item), item)
    }
    return map
  }, [featured, getId])

  const candidates = useMemo<AddFeaturedCandidate[]>(() => {
    return items
      .filter((item) => item.id != null && !item.featured)
      .map((item) => ({
        id: getId(item),
        title: getTitle(item),
        subtitle: getSubtitle(item),
        coverUrl: getCoverUrl(item),
        fallbackIcon,
      }))
  }, [items, getId, getTitle, getSubtitle, getCoverUrl, fallbackIcon])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const runPatch = useCallback(
    async (
      id: number,
      payload: { featured?: boolean; featuredOrder?: number },
    ) => {
      setPendingId(id)
      try {
        await onPatch(id, payload)
      } catch {
        toastError(NS.error.generic)
        throw new Error("patch failed")
      } finally {
        setPendingId(null)
      }
    },
    [onPatch],
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = Number(active.id)
    const overId = Number(over.id)
    const previousIds = orderedIds
    const nextIds = reorderFeaturedIds(previousIds, activeId, overId)
    if (nextIds === previousIds) return

    setOrderedIds(nextIds)
    const patches = orderPatches(previousIds, nextIds)
    if (patches.length === 0) return

    setIsReordering(true)
    try {
      await Promise.all(
        patches.map((patch) =>
          runPatch(patch.id, { featured: true, featuredOrder: patch.featuredOrder }),
        ),
      )
      toast.success(NS.toast.reordered)
    } catch {
      setOrderedIds(previousIds)
    } finally {
      setIsReordering(false)
    }
  }

  async function handleRemove(id: number) {
    await runPatch(id, { featured: false })
    toast.success(NS.toast.removed)
  }

  async function handleAdd(id: number) {
    const order = nextFeaturedOrder(featured)
    await runPatch(id, { featured: true, featuredOrder: order })
    toast.success(NS.toast.added)
    setAddOpen(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <p className="text-muted-foreground mb-4 text-sm">{NS.error.generic}</p>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            دووبارە هەوڵبدەرەوە
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {NS.actions.drag}
        </p>
        <Button
          type="button"
          size="sm"
          onClick={() => setAddOpen(true)}
          disabled={candidates.length === 0 && !isLoading}
        >
          {addLabel}
        </Button>
      </div>

      {orderedIds.length === 0 ? (
        <div className="border-border bg-muted/15 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center">
          <div className="bg-primary/10 text-primary mb-4 flex size-14 items-center justify-center rounded-2xl">
            {fallbackIcon}
          </div>
          <h3 className="mb-1 text-base font-medium">{emptyTitle}</h3>
          <p className="text-muted-foreground mb-5 max-w-sm text-sm">
            {emptySubtitle}
          </p>
          <Button
            type="button"
            onClick={() => setAddOpen(true)}
            disabled={candidates.length === 0}
          >
            {addLabel}
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => void handleDragEnd(e)}
        >
          <SortableContext
            items={orderedIds.map(String)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {orderedIds.map((id, index) => {
                const item = featuredById.get(id)
                if (!item) return null
                return (
                  <FeaturedSortableRow
                    key={id}
                    id={id}
                    order={index}
                    title={getTitle(item)}
                    subtitle={getSubtitle(item)}
                    coverUrl={getCoverUrl(item)}
                    coverAspect={coverAspect}
                    fallbackIcon={fallbackIcon}
                    detailHref={detailHref(id)}
                    editHref={editHref(id)}
                    isPending={
                      pendingId === id || isReordering
                    }
                    onRemove={() => void handleRemove(id)}
                  />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AddFeaturedDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title={dialogTitle}
        candidates={candidates}
        isLoading={isLoading}
        isPending={pendingId != null}
        onSelect={(id) => void handleAdd(id)}
      />
    </div>
  )
}
