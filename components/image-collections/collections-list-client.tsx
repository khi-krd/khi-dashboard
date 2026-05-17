"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { PaginationState, SortingState } from "@tanstack/react-table"
import { toast } from "sonner"
import {
  Bars3Icon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline"

import {
  CollectionBreadcrumbBar,
  dashboardCollectionsCrumbHref,
} from "@/components/image-collections/collection-breadcrumb"
import { CollectionDeleteDialog } from "@/components/image-collections/collection-delete-dialog"
import { CollectionsDataGrid } from "@/components/image-collections/collections-data-grid"
import { CollectionsFiltersToolbar } from "@/components/image-collections/collections-filters"
import { CollectionsGrid } from "@/components/image-collections/collections-grid"
import { CollectionErrorState } from "@/components/image-collections/collection-error-state"
import { NS } from "@/components/image-collections/collections-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  useCollectionTopicsQuery,
  useCollectionsListQuery,
  useDeleteCollectionMutation,
} from "@/hooks/useImageCollections"
import { collectionKeys } from "@/lib/image-collections-query-keys"
import {
  getStoredViewMode,
  setStoredViewMode,
  type CollectionsViewMode,
} from "@/lib/image-collections-view-mode"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { toastError } from "@/lib/toast"
import type { CollectionDto } from "@/types/image-collections"
import type {
  CollectionAdminTableRow,
  CollectionsUiLanguageFilter,
  CollectionsUiTypeFilter,
} from "@/types/image-collections-ui"
import {
  matchesCollectionClientSearchFilter,
  matchesCollectionLanguageFilter,
  matchesCollectionTopicFilter,
  matchesCollectionTypeFilter,
  toCollectionAdminRow,
} from "@/types/image-collections-ui"

function ListSkeleton({ viewMode }: { viewMode: CollectionsViewMode }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
        ))}
      </div>
    )
  }
  return (
    <div className="border-border overflow-hidden rounded-lg border">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-none" />
      ))}
    </div>
  )
}

export function CollectionsListClient() {
  return (
    <Suspense fallback={<ListSkeleton viewMode="grid" />}>
      <CollectionsListClientInner />
    </Suspense>
  )
}

function CollectionsListClientInner() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const sp = useSearchParams()
  const urlTopic = sp.get("topic")

  const [viewMode, setViewMode] = useState<CollectionsViewMode>("grid")
  useEffect(() => {
    setViewMode(getStoredViewMode())
  }, [])

  const [searchRaw, setSearchRaw] = useState("")
  const debouncedKw = useDebouncedValue(searchRaw.trim(), 300)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: "sortDate", desc: true },
  ])

  const [typeFilter, setTypeFilter] = useState<CollectionsUiTypeFilter>("all")
  const [topicId, setTopicId] = useState<number | null>(
    urlTopic && Number.isFinite(Number(urlTopic)) ? Number(urlTopic) : null,
  )
  const [language, setLanguage] = useState<CollectionsUiLanguageFilter>("all")
  const [deleteTarget, setDeleteTarget] =
    useState<CollectionAdminTableRow | null>(null)

  useEffect(() => {
    if (urlTopic && Number.isFinite(Number(urlTopic))) {
      setTopicId(Number(urlTopic))
    }
  }, [urlTopic])

  const listQuery = useCollectionsListQuery({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    typeFilter: typeFilter === "all" ? "all" : typeFilter,
    topicId,
    languageFilter: language,
  })

  const topicsQuery = useCollectionTopicsQuery()
  const topics = topicsQuery.data ?? []

  const rawRows = useMemo(
    () => listQuery.data?.content ?? [],
    [listQuery.data],
  )

  const recordCount = listQuery.data?.totalElements ?? 0

  const filtered = useMemo(() => {
    return rawRows.filter((r) => {
      if (!matchesCollectionTypeFilter(r, typeFilter)) return false
      if (!matchesCollectionTopicFilter(r, topicId)) return false
      if (!matchesCollectionLanguageFilter(r, language)) return false
      if (!matchesCollectionClientSearchFilter(r, debouncedKw)) return false
      return true
    })
  }, [debouncedKw, language, rawRows, topicId, typeFilter])

  const gridRows = useMemo(
    () => filtered.map((r) => toCollectionAdminRow(r)),
    [filtered],
  )

  const deleteMut = useDeleteCollectionMutation()

  const showReset =
    searchRaw.trim().length > 0 ||
    typeFilter !== "all" ||
    topicId != null ||
    language !== "all"

  const noExtraFilters =
    typeFilter === "all" && topicId == null && language === "all" && searchRaw.trim() === ""

  useEffect(() => {
    queueMicrotask(() => {
      setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }))
    })
  }, [debouncedKw, typeFilter, topicId, language])

  const onResetFilters = () => {
    setSearchRaw("")
    setTypeFilter("all")
    setTopicId(null)
    setLanguage("all")
    router.replace("/dashboard/image-collections")
  }

  const seedDetailCache = useCallback(
    (row: CollectionDto) => {
      if (row.id == null) return
      queryClient.setQueryData(collectionKeys.detail(row.id), row)
    },
    [queryClient],
  )

  const onView = (row: CollectionAdminTableRow) => {
    if (row.id == null) return
    seedDetailCache(row)
    router.push(`/dashboard/image-collections/${row.id}`)
  }

  const onEdit = (row: CollectionAdminTableRow) => {
    if (row.id == null) return
    seedDetailCache(row)
    router.push(`/dashboard/image-collections/${row.id}/edit`)
  }

  const isLoading = listQuery.isLoading || listQuery.isFetching

  const showNoCollectionsEmpty =
    !isLoading &&
    gridRows.length === 0 &&
    rawRows.length === 0 &&
    noExtraFilters &&
    debouncedKw.trim() === ""

  function changeViewMode(mode: CollectionsViewMode) {
    setViewMode(mode)
    setStoredViewMode(mode)
  }

  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <CollectionBreadcrumbBar
        className="mb-3"
        segments={[
          {
            label: NS.breadcrumb.dashboard,
            href: dashboardCollectionsCrumbHref(),
          },
          { label: NS.page.title },
        ]}
      />

      <header className="border-border/60 flex flex-col gap-6 border-b pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{NS.page.title}</h1>
          <p className="text-muted-foreground max-w-xl text-sm">{NS.page.subtitle}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {NS.total.count(formatCkbDigits(recordCount))}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/image-collections/topics"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
          >
            <Cog6ToothIcon className="size-4" aria-hidden />
            {NS.topics.link}
          </Link>
          <Link
            href="/dashboard/image-collections/new"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "inline-flex items-center gap-1.5",
            )}
          >
            <PlusIcon className="size-4" aria-hidden />
            {NS.action.new}
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-muted/50 inline-flex rounded-lg p-1">
          <button
            type="button"
            title={NS.view_mode.grid}
            onClick={() => changeViewMode("grid")}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Squares2X2Icon className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            title={NS.view_mode.table}
            onClick={() => changeViewMode("table")}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-md transition-colors",
              viewMode === "table"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Bars3Icon className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <CollectionsFiltersToolbar
        search={searchRaw}
        onSearchChange={setSearchRaw}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        topicId={topicId}
        topics={topics}
        onTopicChange={setTopicId}
        language={language}
        onLanguageChange={setLanguage}
        showReset={showReset}
        onReset={onResetFilters}
      />

      {listQuery.isError ? (
        <CollectionErrorState onRetry={() => void listQuery.refetch()} />
      ) : isLoading ? (
        <ListSkeleton viewMode={viewMode} />
      ) : gridRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {showNoCollectionsEmpty ? (
            <>
              <PhotoIcon
                className="text-muted-foreground/40 mb-4 size-12"
                aria-hidden
              />
              <h2 className="text-foreground mb-2 text-base font-medium">
                {NS.empty.no_collections.title}
              </h2>
              <p className="text-muted-foreground mb-4 max-w-md text-sm">
                {NS.empty.no_collections.subtitle}
              </p>
              <Link
                href="/dashboard/image-collections/new"
                className={cn(buttonVariants({ variant: "default" }), "gap-1.5")}
              >
                <PlusIcon className="size-4" aria-hidden />
                {NS.action.new}
              </Link>
            </>
          ) : (
            <>
              <MagnifyingGlassIcon
                className="text-muted-foreground/40 mb-4 size-12"
                aria-hidden
              />
              <h2 className="text-foreground mb-2 text-base font-medium">
                {NS.empty.no_results.title}
              </h2>
              <p className="text-muted-foreground mb-4 max-w-md text-sm">
                {NS.empty.no_results.subtitle}
              </p>
              <Button type="button" variant="ghost" onClick={onResetFilters}>
                {NS.empty.no_results.cta}
              </Button>
            </>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <CollectionsGrid
          rows={gridRows}
          onView={onView}
          onEdit={onEdit}
          onDelete={setDeleteTarget}
        />
      ) : (
        <CollectionsDataGrid
          rows={gridRows}
          pagination={pagination}
          onPaginationChange={(updater) => {
            setPagination((prev) =>
              typeof updater === "function" ? updater(prev) : updater,
            )
          }}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={isLoading}
          recordCount={recordCount}
          onView={onView}
          onEdit={onEdit}
          onDeleteOne={setDeleteTarget}
        />
      )}

      <CollectionDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
        target={
          deleteTarget
            ? {
                id: deleteTarget.id,
                collectionType: deleteTarget.collectionType,
                ckbCoverUrl: deleteTarget.ckbCoverUrl,
                imageAlbum: deleteTarget.imageAlbum,
                titleCkb: deleteTarget.titleCkb,
              }
            : null
        }
        isPending={deleteMut.isPending}
        onConfirm={() => {
          const id = deleteTarget?.id
          if (id == null) return
          setDeleteTarget(null)
          deleteMut.mutate(id, {
            onSuccess: () => toast(NS.toast.deleted),
            onError: () => toastError(NS.error.generic),
          })
        }}
      />
    </div>
  )
}
