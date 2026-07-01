"use client"

import { useMemo } from "react"
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline"

import { FeaturedCatalogRow } from "@/components/featured/featured-catalog-row"
import { FeaturedListPagination } from "@/components/featured/featured-list-pagination"
import { NS } from "@/components/featured/featured-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FEATURED_CATALOG_CATEGORIES,
  FEATURED_CATEGORY_LABELS,
  filterCatalogItems,
  type FeaturedCatalogCategory,
  type FeaturedCatalogItem,
  type FeaturedCatalogStatusFilter,
} from "@/lib/featured-catalog"
import { formatCkbDigits } from "@/lib/intl-ckb"

export function FeaturedCatalogBrowser({
  items,
  isLoading,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  pendingKey,
  onFeature,
  onUnfeature,
  emptyMessage,
  compact = false,
  showFilters = true,
  useCategoryTabs = false,
  pageIndex,
  pageSize,
  totalElements,
  onPageChange,
  onPageSizeChange,
}: {
  items: FeaturedCatalogItem[]
  isLoading?: boolean
  search: string
  onSearchChange: (value: string) => void
  category: FeaturedCatalogCategory
  onCategoryChange: (value: FeaturedCatalogCategory) => void
  status: FeaturedCatalogStatusFilter
  onStatusChange: (value: FeaturedCatalogStatusFilter) => void
  pendingKey?: string | null
  onFeature?: (item: FeaturedCatalogItem) => void
  onUnfeature?: (item: FeaturedCatalogItem) => void
  emptyMessage?: string
  compact?: boolean
  showFilters?: boolean
  useCategoryTabs?: boolean
  pageIndex: number
  pageSize: number
  totalElements: number
  onPageChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  const filtered = useMemo(() => {
    if (!showFilters) return items
    return filterCatalogItems(items, { search, category, status })
  }, [items, search, category, status, showFilters])

  const displayItems = showFilters ? filtered : items
  const displayTotal = showFilters ? filtered.length : totalElements

  const anyFilterActive =
    search.trim().length > 0 || category !== "all" || status !== "all"

  const categoryTabs = FEATURED_CATALOG_CATEGORIES.filter((c) => c !== "all")

  return (
    <div className="space-y-4">
      {showFilters ? (
        <>
          <div className="relative">
            <MagnifyingGlassIcon className="text-muted-foreground absolute inset-e-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={NS.filters.search_placeholder}
              className="border-border bg-background h-9 pe-10 ps-3"
            />
          </div>

          {useCategoryTabs ? (
            <Tabs
              value={category === "all" ? "sounds" : category}
              onValueChange={(v) =>
                onCategoryChange(v as FeaturedCatalogCategory)
              }
              className="gap-3"
            >
              <TabsList
                variant="line"
                className="h-auto w-full flex-wrap justify-start gap-1"
              >
                {categoryTabs.map((key) => (
                  <TabsTrigger key={key} value={key} className="text-sm">
                    {FEATURED_CATEGORY_LABELS[key]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select
                value={category}
                onValueChange={(v) =>
                  onCategoryChange(v as FeaturedCatalogCategory)
                }
              >
                <SelectTrigger className="bg-background h-9 w-full sm:w-40">
                  <SelectValue placeholder={NS.filters.category_all} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{NS.filters.category_all}</SelectItem>
                  {categoryTabs.map((key) => (
                    <SelectItem key={key} value={key}>
                      {FEATURED_CATEGORY_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={status}
                onValueChange={(v) =>
                  onStatusChange(v as FeaturedCatalogStatusFilter)
                }
              >
                <SelectTrigger className="bg-background h-9 w-full sm:w-36">
                  <SelectValue placeholder={NS.filters.status_all} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{NS.filters.status_all}</SelectItem>
                  <SelectItem value="featured">
                    {NS.filters.status_featured}
                  </SelectItem>
                  <SelectItem value="not_featured">
                    {NS.filters.status_not_featured}
                  </SelectItem>
                </SelectContent>
              </Select>
              {anyFilterActive ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground h-9"
                  onClick={() => {
                    onSearchChange("")
                    onCategoryChange("all")
                    onStatusChange("all")
                  }}
                >
                  <XMarkIcon className="me-1 size-3.5" />
                  {NS.filters.reset}
                </Button>
              ) : null}
            </div>
          )}

          {useCategoryTabs ? (
            <Select
              value={status}
              onValueChange={(v) =>
                onStatusChange(v as FeaturedCatalogStatusFilter)
              }
            >
              <SelectTrigger className="bg-background h-9 w-full sm:w-40">
                <SelectValue placeholder={NS.filters.status_all} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{NS.filters.status_all}</SelectItem>
                <SelectItem value="featured">
                  {NS.filters.status_featured}
                </SelectItem>
                <SelectItem value="not_featured">
                  {NS.filters.status_not_featured}
                </SelectItem>
              </SelectContent>
            </Select>
          ) : null}
        </>
      ) : null}

      <p className="text-muted-foreground text-sm">
        {NS.filters.results(formatCkbDigits(displayTotal))}
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: compact ? 4 : 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-xl border border-dashed py-14 text-center text-base">
          {emptyMessage ?? NS.filters.no_results}
        </div>
      ) : (
        <div className="space-y-2">
          {displayItems.map((item) => (
            <FeaturedCatalogRow
              key={item.key}
              item={item}
              isPending={pendingKey === item.key}
              onFeature={onFeature}
              onUnfeature={onUnfeature}
            />
          ))}
        </div>
      )}

      <FeaturedListPagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalElements={displayTotal}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
