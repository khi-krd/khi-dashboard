"use client"

import { Suspense, useCallback, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { PlusIcon, SparklesIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

import { AddFeaturedSheet } from "@/components/featured/add-featured-sheet"
import { FeaturedPanel } from "@/components/featured/featured-panel"
import { NS } from "@/components/featured/featured-strings"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useFeaturedAllQuery,
  usePatchFeaturedMutation,
} from "@/hooks/useFeatured"
import type { FeaturedCatalogCategory, FeaturedCatalogItem } from "@/lib/featured-catalog"
import { nextFeaturedOrder } from "@/lib/featured-utils"
import { toastError } from "@/lib/toast"
import type { FeaturedPayload } from "@/types/featured"

const FEATURED_PAGE_SIZE = 100

function PageSkeleton() {
  return (
    <div dir="rtl" className="space-y-6 px-4 py-6 lg:px-6">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.5rem] rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function FeaturedListClient() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FeaturedListClientInner />
    </Suspense>
  )
}

function FeaturedListClientInner() {
  const queryClient = useQueryClient()
  const featuredQ = useFeaturedAllQuery(0, FEATURED_PAGE_SIZE)
  const featuredMut = usePatchFeaturedMutation()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetCategory, setSheetCategory] =
    useState<FeaturedCatalogCategory>("sounds")
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  const featuredItems = useMemo(
    () => (featuredQ.data?.items ?? []).filter((item) => item.featured),
    [featuredQ.data?.items],
  )

  const refreshFeatured = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["featured"] })
    await queryClient.invalidateQueries({ queryKey: ["featured-catalog"] })
  }, [queryClient])

  const patchItem = useCallback(
    async (item: FeaturedCatalogItem, payload: FeaturedPayload) => {
      if (!item.canFeature) return
      setPendingKey(item.key)
      try {
        await featuredMut.mutateAsync({ item, payload })
        await refreshFeatured()
      } catch {
        toastError(NS.error.generic)
        throw new Error("patch failed")
      } finally {
        setPendingKey(null)
      }
    },
    [featuredMut, refreshFeatured],
  )

  const handleFeature = useCallback(
    async (item: FeaturedCatalogItem) => {
      const sameCategory = featuredItems.filter(
        (entry) => entry.category === item.category,
      )
      await patchItem(item, {
        featured: true,
        featuredOrder: nextFeaturedOrder(
          sameCategory.map((entry) => ({
            id: entry.id,
            featured: true,
            featuredOrder: entry.featuredOrder,
          })),
        ),
      })
      toast.success(NS.toast.added)
    },
    [patchItem, featuredItems],
  )

  const handleUnfeature = useCallback(
    async (item: FeaturedCatalogItem) => {
      await patchItem(item, { featured: false })
      toast.success(NS.toast.removed)
    },
    [patchItem],
  )

  function openBrowseSheet(category: FeaturedCatalogCategory = "sounds") {
    setSheetCategory(category)
    setSheetOpen(true)
  }

  return (
    <div dir="rtl" className="space-y-6 px-4 py-6 lg:px-6">
      <header className="from-primary/10 via-primary/5 relative overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent p-6 sm:p-8">
        <div className="relative z-[1] flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="text-primary mb-2 flex items-center gap-2">
              <SparklesIcon className="size-5" aria-hidden />
              <span className="text-sm font-medium tracking-wide uppercase">
                {NS.breadcrumb.featured}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {NS.title}
            </h1>
            <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
              {NS.subtitle}
            </p>
          </div>
          <Button
            type="button"
            className="shrink-0"
            onClick={() => openBrowseSheet()}
          >
            <PlusIcon className="me-1.5 size-4" />
            {NS.actions.browse}
          </Button>
        </div>
        <div
          className="pointer-events-none absolute -start-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -end-6 bottom-0 size-32 rounded-full bg-primary/5 blur-2xl"
          aria-hidden
        />
      </header>

      <FeaturedPanel
        items={featuredItems}
        isLoading={featuredQ.isLoading}
        isError={featuredQ.isError}
        onRetry={() => void refreshFeatured()}
        onPatch={patchItem}
      />

      <AddFeaturedSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        isPending={pendingKey != null}
        pendingKey={pendingKey}
        initialCategory={sheetCategory}
        initialStatus="not_featured"
        onFeature={handleFeature}
        onUnfeature={handleUnfeature}
      />
    </div>
  )
}
