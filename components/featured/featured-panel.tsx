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
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { FeaturedCategoryIcon } from "@/components/featured/featured-category-icon"
import { FeaturedListPagination } from "@/components/featured/featured-list-pagination"
import { FeaturedSortableRow } from "@/components/featured/featured-sortable-row"
import { NS } from "@/components/featured/featured-strings"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { FeaturedCatalogItem } from "@/lib/featured-catalog"
import { featuredOrderPatches, reorderFeaturedKeys } from "@/lib/featured-utils"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { toastError } from "@/lib/toast"

type FeaturedPanelProps = {
  items: FeaturedCatalogItem[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  onPatch: (
    item: FeaturedCatalogItem,
    payload: { featured?: boolean; featuredOrder?: number },
  ) => Promise<void>
}

export function FeaturedPanel({
  items,
  isLoading,
  isError,
  onRetry,
  onPatch,
}: FeaturedPanelProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [orderedKeys, setOrderedKeys] = useState<string[]>([])
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

  useEffect(() => {
    setOrderedKeys(featuredItems.map((item) => item.key))
    setPageIndex(0)
  }, [featuredItems])

  const pageCount = Math.max(1, Math.ceil(featuredItems.length / pageSize))
  useEffect(() => {
    if (pageIndex > pageCount - 1) {
      setPageIndex(Math.max(0, pageCount - 1))
    }
  }, [pageIndex, pageCount])

  const pageKeys = useMemo(() => {
    const start = pageIndex * pageSize
    return orderedKeys.slice(start, start + pageSize)
  }, [orderedKeys, pageIndex, pageSize])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const runPatch = useCallback(
    async (
      item: FeaturedCatalogItem,
      payload: { featured?: boolean; featuredOrder?: number },
    ) => {
      setPendingKey(item.key)
      try {
        await onPatch(item, payload)
      } catch {
        toastError(NS.error.generic)
        throw new Error("patch failed")
      } finally {
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
    const previousKeys = orderedKeys
    const nextKeys = reorderFeaturedKeys(previousKeys, activeKey, overKey)
    if (nextKeys === previousKeys) return

    setOrderedKeys(nextKeys)
    const patches = featuredOrderPatches(featuredByKey, nextKeys)
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

  async function handleRemove(item: FeaturedCatalogItem) {
    await runPatch(item, { featured: false })
    toast.success(NS.toast.removed)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <p className="text-muted-foreground mb-4 text-base">{NS.error.generic}</p>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            دووبارە هەوڵبدەرەوە
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{NS.views.featured}</h2>
          <p className="text-muted-foreground text-sm">
            {NS.actions.drag}
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
          <h3 className="mb-1 text-lg font-medium">{NS.empty.title}</h3>
          <p className="text-muted-foreground max-w-sm text-base">{NS.empty.subtitle}</p>
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => void handleDragEnd(e)}
          >
            <SortableContext
              items={pageKeys}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {pageKeys.map((key) => {
                  const item = featuredByKey.get(key)
                  if (!item) return null
                  const globalOrder = orderedKeys.indexOf(key)
                  return (
                    <FeaturedSortableRow
                      key={key}
                      id={key}
                      order={globalOrder}
                      title={item.title}
                      subtitle={item.subtitle}
                      categoryLabel={item.categoryLabel}
                      coverUrl={item.coverUrl}
                      coverAspect={item.coverAspect}
                      fallbackIcon={
                        <FeaturedCategoryIcon category={item.category} />
                      }
                      detailHref={item.detailHref}
                      editHref={item.editHref}
                      isPending={pendingKey === key || isReordering}
                      onRemove={() => void handleRemove(item)}
                    />
                  )
                })}
              </div>
            </SortableContext>
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
