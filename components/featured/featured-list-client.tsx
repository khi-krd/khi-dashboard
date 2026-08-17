"use client"

import { Suspense, useCallback, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { PlusIcon, SparklesIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

import { AddFeaturedSheet } from "@/components/featured/add-featured-sheet"
import { FeaturedPanel } from "@/components/featured/featured-panel"
import { FeaturedSlideBudget } from "@/components/featured/featured-slide-budget"
import { blockedReason, NS } from "@/components/featured/featured-strings"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useFeaturedAllQuery,
  usePatchFeaturedMutation,
} from "@/hooks/useFeatured"
import { extractApiErrorReason } from "@/lib/api-error"
import {
  countsTowardSlideCap,
  MAX_FEATURED_SLIDES,
  type FeaturedCatalogCategory,
  type FeaturedCatalogItem,
} from "@/lib/featured-catalog"
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

  // The two surfaces are managed as two lists. They stopped sharing anything
  // that made one list meaningful: a carousel slide competes for a capped slot
  // and is ordered against every other slide, while a page highlight is
  // uncapped and ordered only against the other rows of its own page.
  const heroItems = useMemo(
    () => featuredItems.filter(countsTowardSlideCap),
    [featuredItems],
  )
  // Grouped by source, not interleaved by order. Each source is numbered from
  // zero independently (they rank rows on different pages), so sorting the two
  // together on `featuredOrder` alone would produce service 1, about 1,
  // service 2, about 2 — an order that means nothing on either page.
  const pageItems = useMemo(
    () =>
      featuredItems
        .filter((item) => !countsTowardSlideCap(item))
        .sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category)
          }
          const aOrder = a.featuredOrder ?? Number.POSITIVE_INFINITY
          const bOrder = b.featuredOrder ?? Number.POSITIVE_INFINITY
          return aOrder !== bOrder ? aOrder - bOrder : b.id - a.id
        }),
    [featuredItems],
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
      } catch (err) {
        // `details.reason` names the actual cause — the cap, a missing hero
        // picture, unsaved donation settings — so it beats a generic retry.
        toastError(extractApiErrorReason(err) ?? NS.error.generic)
        throw new Error("patch failed")
      } finally {
        setPendingKey(null)
      }
    },
    [featuredMut, refreshFeatured],
  )

  const handleFeature = useCallback(
    async (item: FeaturedCatalogItem, featureImageUrl?: string) => {
      // No local cap check on purpose. `MAX_FEATURED_SLIDES` is a client-side
      // copy of a database-only setting, so refusing here would make slides
      // unaddable the moment someone raises the real limit. The counter warns,
      // the server decides, and its `details.reason` explains a rejection.
      const hero = featureImageUrl?.trim()
      const blocked = blockedReason(
        hero ? { ...item, featureImageUrl: hero } : item,
      )
      if (blocked) {
        toastError(blocked)
        return
      }
      // Appended to whichever sequence actually reads it: the carousel numbers
      // all its slides together, a page highlight only ranks against the other
      // rows of its own source.
      const siblings =
        item.surface === "hero"
          ? heroItems
          : pageItems.filter((entry) => entry.category === item.category)

      await patchItem(item, {
        featured: true,
        featuredOrder: nextFeaturedOrder(
          siblings.map((entry) => ({
            id: entry.id,
            featured: true,
            featuredOrder: entry.featuredOrder,
          })),
        ),
        // Omitted when the row supplied nothing, which the API reads as "leave
        // the stored picture alone" — so re-featuring keeps the old hero.
        ...(hero ? { featureImageUrl: hero } : {}),
      })
      toast.success(NS.toast.added)
    },
    [patchItem, heroItems, pageItems],
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

      {/*
        Loading and error belong to the page, not to either panel: the two
        panels share one query, so letting each render its own state produced
        the skeleton twice and two competing retry buttons.
      */}
      {featuredQ.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />
          ))}
        </div>
      ) : featuredQ.isError ? (
        <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground mb-4 text-base">
            {NS.error.generic}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refreshFeatured()}
          >
            {NS.retryLabel}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <FeaturedSlideBudget items={heroItems} />

          <FeaturedPanel
            items={heroItems}
            onPatch={patchItem}
            heading={NS.surfaces.hero.heading}
            description={NS.surfaces.hero.description}
            emptyTitle={NS.surfaces.hero.emptyTitle}
            emptySubtitle={NS.surfaces.hero.emptySubtitle}
            orderScope="global"
          />

          {/*
            No budget widget above this one, deliberately: page highlights are
            uncapped, and a counter would reintroduce exactly the "these compete
            for slides" impression this change removes.
          */}
          <FeaturedPanel
            items={pageItems}
            onPatch={patchItem}
            heading={NS.surfaces.page.heading}
            description={NS.surfaces.page.description}
            emptyTitle={NS.surfaces.page.emptyTitle}
            emptySubtitle={NS.surfaces.page.emptySubtitle}
            orderScope="category"
          />
        </div>
      )}

      <AddFeaturedSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        isPending={pendingKey != null}
        pendingKey={pendingKey}
        initialCategory={sheetCategory}
        initialStatus="not_featured"
        capReached={heroItems.length >= MAX_FEATURED_SLIDES}
        onFeature={handleFeature}
        onUnfeature={handleUnfeature}
      />
    </div>
  )
}
