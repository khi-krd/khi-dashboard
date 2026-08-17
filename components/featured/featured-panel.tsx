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
import { SparklesIcon } from "@heroicons/react/24/outline"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"

import { useSyncedState } from "@/hooks/use-synced-state"
import { FeaturedCategoryIcon } from "@/components/featured/featured-category-icon"
import { FeaturedListPagination } from "@/components/featured/featured-list-pagination"
import { FeaturedSortableRow } from "@/components/featured/featured-sortable-row"
import {
  featureImageStrings,
  NS,
  surfaceNote,
} from "@/components/featured/featured-strings"
import {
  FEATURED_CATEGORY_LABELS,
  type FeaturedCatalogItem,
} from "@/lib/featured-catalog"
import {
  featuredOrderPatches,
  reorderFeaturedKeys,
  type FeaturedOrderScope,
} from "@/lib/featured-utils"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { FeaturedPayload } from "@/types/featured"

type FeaturedPanelProps = {
  items: FeaturedCatalogItem[]
  onPatch: (
    item: FeaturedCatalogItem,
    payload: FeaturedPayload,
  ) => Promise<void>
  heading: string
  description: string
  emptyTitle: string
  emptySubtitle: string
  /**
   * How a drag renumbers this list. Carousel slides share one running order;
   * page highlights are read per page, so each source restarts at zero.
   */
  orderScope?: FeaturedOrderScope
}

export function FeaturedPanel({
  items,
  onPatch,
  heading,
  description,
  emptyTitle,
  emptySubtitle,
  orderScope = "global",
}: FeaturedPanelProps) {
  const [pageSize, setPageSize] = useState(10)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  const featuredItems = useMemo(
    () => items.filter((item) => item.featured),
    [items],
  )

  const featuredByKey = useMemo(() => {
    const map = new Map<string, FeaturedCatalogItem>()
    for (const item of featuredItems) {
      map.set(item.key, item)
    }
    return map
  }, [featuredItems])

  // Local drag order, re-seeded whenever the featured set itself changes.
  const [orderedKeys, setOrderedKeys] = useSyncedState<string[]>(
    [featuredItems],
    () => featuredItems.map((item) => item.key),
    () => featuredItems.map((item) => item.key),
  )
  const [selectedPage, setPageIndex] = useSyncedState(
    [featuredItems],
    () => 0,
    () => 0,
  )

  const pageCount = Math.max(1, Math.ceil(featuredItems.length / pageSize))
  // Clamped by derivation instead of an effect that corrected it a render late.
  const pageIndex = Math.min(selectedPage, pageCount - 1)

  const pageKeys = useMemo(() => {
    const start = pageIndex * pageSize
    return orderedKeys.slice(start, start + pageSize)
  }, [orderedKeys, pageIndex, pageSize])

  /**
   * The visible page of rows, split into drag groups. Global scope is one
   * unlabelled group; category scope is one labelled group per source, which
   * is what makes "you can only reorder within a source" legible.
   */
  const rowGroups = useMemo(() => {
    if (orderScope === "global") {
      return [{ key: "all", label: null as string | null, keys: pageKeys }]
    }
    const byCategory = new Map<string, string[]>()
    for (const key of pageKeys) {
      const item = featuredByKey.get(key)
      if (!item) continue
      const list = byCategory.get(item.category) ?? []
      list.push(key)
      byCategory.set(item.category, list)
    }
    return [...byCategory.entries()].map(([category, keys]) => ({
      key: category,
      label:
        FEATURED_CATEGORY_LABELS[
          category as keyof typeof FEATURED_CATEGORY_LABELS
        ] ?? null,
      keys,
    }))
  }, [pageKeys, featuredByKey, orderScope])

  /**
   * The number on the row's badge. It has to match the sequence that was
   * actually written, so under category scope it counts within the row's own
   * source — a list-wide index would show an About row as 3rd while `/about`
   * ranks it 1st, offset by however many service rows happened to sort above.
   */
  const displayOrderByKey = useMemo(() => {
    const map = new Map<string, number>()
    const counters = new Map<string, number>()
    for (const key of orderedKeys) {
      const item = featuredByKey.get(key)
      if (!item) continue
      const bucket = orderScope === "global" ? "" : item.category
      const next = counters.get(bucket) ?? 0
      map.set(key, next)
      counters.set(bucket, next + 1)
    }
    return map
  }, [orderedKeys, featuredByKey, orderScope])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const runPatch = useCallback(
    async (item: FeaturedCatalogItem, payload: FeaturedPayload) => {
      setPendingKey(item.key)
      try {
        await onPatch(item, payload)
      } finally {
        // No catch on purpose: `onPatch` has already toasted the server's own
        // explanation, and adding a generic retry here would stack two toasts
        // and leave the useless one on top. The rejection still propagates so
        // the drag handler can roll its optimistic order back.
        setPendingKey(null)
      }
    },
    [onPatch],
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeKey = String(active.id)
    const overKey = String(over.id)

    // Under category scope each source is numbered independently, so moving a
    // row across sources changes no number anywhere. Rejected here rather than
    // after the fact: painting the new order first and only then discovering
    // there is nothing to persist left the row sitting in a position that
    // silently snapped back on the next refetch.
    if (orderScope === "category") {
      const activeCategory = featuredByKey.get(activeKey)?.category
      const overCategory = featuredByKey.get(overKey)?.category
      if (activeCategory !== overCategory) return
    }

    const previousKeys = orderedKeys
    const nextKeys = reorderFeaturedKeys(previousKeys, activeKey, overKey)
    if (nextKeys === previousKeys) return

    setOrderedKeys(nextKeys)
    const patches = featuredOrderPatches(featuredByKey, nextKeys, orderScope)
    if (patches.length === 0) return

    setIsReordering(true)
    try {
      await Promise.all(
        patches.map((patch) => {
          const item = featuredByKey.get(patch.key)
          if (!item) return Promise.resolve()
          return runPatch(item, {
            featured: true,
            featuredOrder: patch.featuredOrder,
          })
        }),
      )
      toast.success(NS.toast.reordered)
    } catch {
      setOrderedKeys(previousKeys)
    } finally {
      setIsReordering(false)
    }
  }

  // Terminal handlers: `runPatch` rejects on failure with the reason already
  // toasted upstream, so the rejection is absorbed here rather than escaping
  // to the window as an unhandled promise.
  async function handleRemove(item: FeaturedCatalogItem) {
    try {
      await runPatch(item, { featured: false })
      toast.success(NS.toast.removed)
    } catch {
      /* already reported */
    }
  }

  /**
   * `featured: true` rides along because the PATCH treats an omitted `featured`
   * as true anyway, and `featuredOrder` is left out so the slide keeps its
   * position — only the picture changes.
   */
  async function handleFeatureImage(item: FeaturedCatalogItem, url: string) {
    try {
      await runPatch(item, { featured: true, featureImageUrl: url })
      toast.success(url ? NS.toast.imageUpdated : NS.toast.imageRemoved)
    } catch {
      /* already reported */
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{heading}</h2>
          <p className="text-muted-foreground text-sm">
            {description}
            {featuredItems.length > 0
              ? ` · ${formatCkbDigits(featuredItems.length)}`
              : ""}
          </p>
        </div>
      </div>

      {orderedKeys.length === 0 ? (
        <div className="border-border bg-muted/15 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center">
          <div className="bg-primary/10 text-primary mb-4 flex size-14 items-center justify-center rounded-2xl">
            <SparklesIcon className="size-6" aria-hidden />
          </div>
          <h3 className="mb-1 text-lg font-medium">{emptyTitle}</h3>
          <p className="text-muted-foreground max-w-sm text-base">{emptySubtitle}</p>
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => void handleDragEnd(e)}
          >
            {/*
              One group per source under category scope, each with its own
              heading and its own SortableContext. The boundary has to be
              visible: rows are only reorderable within their own source, and a
              single unbroken list gave no hint of that — dragging across it
              just snapped back.
            */}
            {rowGroups.map((group) => (
              <div key={group.key} className="space-y-2 pt-2 first:pt-0">
                {group.label ? (
                  <p className="text-muted-foreground text-xs font-medium">
                    {group.label}
                  </p>
                ) : null}
                <SortableContext
                  items={group.keys}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {group.keys.map((key) => {
                      const item = featuredByKey.get(key)
                      if (!item) return null
                      const rowOrder = displayOrderByKey.get(key) ?? 0
                      return (
                        <FeaturedSortableRow
                          key={key}
                          id={key}
                          order={rowOrder}
                          title={item.title}
                          subtitle={item.subtitle}
                          categoryLabel={item.categoryLabel}
                          coverUrl={item.coverUrl}
                          featureImageUrl={item.featureImageUrl}
                          strictImage={item.strictImage}
                          imageLabel={featureImageStrings(item).label}
                          imageHint={featureImageStrings(item).hint}
                          surfaceNote={surfaceNote(item)}
                          coverAspect={item.coverAspect}
                          fallbackIcon={
                            <FeaturedCategoryIcon category={item.category} />
                          }
                          detailHref={item.detailHref}
                          editHref={item.editHref}
                          isPending={pendingKey === key || isReordering}
                          onRemove={() => void handleRemove(item)}
                          onFeatureImageChange={(url) =>
                            void handleFeatureImage(item, url)
                          }
                        />
                      )
                    })}
                  </div>
                </SortableContext>
              </div>
            ))}
          </DndContext>

          <FeaturedListPagination
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalElements={featuredItems.length}
            onPageChange={setPageIndex}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPageIndex(0)
            }}
          />
        </>
      )}
    </section>
  )
}
