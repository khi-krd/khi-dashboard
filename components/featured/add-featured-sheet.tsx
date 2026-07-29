"use client"

import { useEffect, useMemo, useState } from "react"

import { useSyncedState } from "@/hooks/use-synced-state"
import { FeaturedCatalogBrowser } from "@/components/featured/featured-catalog-browser"
import { NS } from "@/components/featured/featured-strings"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useFeaturedBrowseQuery } from "@/hooks/useFeaturedCatalog"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  filterCatalogItems,
  type FeaturedCatalogCategory,
  type FeaturedCatalogItem,
  type FeaturedCatalogStatusFilter,
} from "@/lib/featured-catalog"

export function AddFeaturedSheet({
  open,
  onOpenChange,
  isPending,
  pendingKey,
  onFeature,
  onUnfeature,
  initialCategory = "sounds",
  initialStatus = "not_featured",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending?: boolean
  pendingKey?: string | null
  onFeature: (item: FeaturedCatalogItem) => void | Promise<void>
  onUnfeature?: (item: FeaturedCatalogItem) => void | Promise<void>
  initialCategory?: FeaturedCatalogCategory
  initialStatus?: FeaturedCatalogStatusFilter
}) {
  // Every filter resets when the sheet closes, so the next open starts clean.
  const closeDeps = [open, initialCategory, initialStatus]
  const defaultCategory = () =>
    initialCategory === "all" ? "sounds" : initialCategory

  const [search, setSearch] = useSyncedState(
    closeDeps,
    () => (open ? undefined : ""),
    () => "",
  )
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const [category, setCategory] = useSyncedState<FeaturedCatalogCategory>(
    closeDeps,
    () => (open ? undefined : defaultCategory()),
    defaultCategory,
  )
  const [status, setStatus] = useSyncedState<FeaturedCatalogStatusFilter>(
    closeDeps,
    () => (open ? undefined : initialStatus),
    () => initialStatus,
  )
  const [pageSize, setPageSize] = useSyncedState(
    closeDeps,
    () => (open ? undefined : 20),
    () => 20,
  )
  // Any change to the result set sends you back to the first page.
  const [pageIndex, setPageIndex] = useSyncedState(
    [open, debouncedSearch, category, status],
    () => 0,
    () => 0,
  )

  const browseQ = useFeaturedBrowseQuery({
    category,
    page: pageIndex,
    size: pageSize,
    search: debouncedSearch,
    enabled: open,
  })

  const displayItems = useMemo(
    () =>
      filterCatalogItems(browseQ.items, {
        search: "",
        category: "all",
        status,
      }),
    [browseQ.items, status],
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-full max-w-none flex-col gap-0 p-0 data-[side=left]:sm:max-w-3xl md:max-w-4xl lg:max-w-5xl"
      >
        <SheetHeader className="border-border border-b px-5 py-4">
          <SheetTitle>{NS.sheet.title}</SheetTitle>
          <SheetDescription>{NS.sheet.subtitle}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <FeaturedCatalogBrowser
            items={displayItems}
            isLoading={browseQ.isLoading}
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            status={status}
            onStatusChange={setStatus}
            pendingKey={pendingKey}
            onFeature={(item) => void onFeature(item)}
            onUnfeature={onUnfeature ? (item) => void onUnfeature(item) : undefined}
            compact
            showFilters
            useCategoryTabs
            emptyMessage={NS.sheet.empty}
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalElements={browseQ.totalElements}
            onPageChange={setPageIndex}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPageIndex(0)
            }}
          />
        </div>

        <SheetFooter className="border-border border-t px-5 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {NS.sheet.close}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
