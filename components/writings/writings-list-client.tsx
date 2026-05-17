"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { PaginationState, SortingState } from "@tanstack/react-table"
import { toast } from "sonner"
import {
  Bars3Icon,
  BookOpenIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  RectangleStackIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline"

import {
  WritingBreadcrumbBar,
  dashboardWritingsCrumbHref,
} from "@/components/writings/writing-breadcrumb"
import { WritingDeleteDialog } from "@/components/writings/writing-delete-dialog"
import { WritingErrorState } from "@/components/writings/writing-error-state"
import { WritingsDataGrid } from "@/components/writings/writings-data-grid"
import { WritingsFiltersToolbar } from "@/components/writings/writings-filters"
import { WritingsShelfGrid } from "@/components/writings/writings-shelf-grid"
import { NS } from "@/components/writings/writings-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  useDeleteWritingMutation,
  useWritingTopicsQuery,
  useWritingsListQuery,
} from "@/hooks/useWritings"
import { writingsKeys } from "@/lib/writings-query-keys"
import {
  getStoredViewMode,
  setStoredViewMode,
  type WritingsViewMode,
} from "@/lib/writings-view-mode"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { toastError } from "@/lib/toast"
import type { BookGenre, WritingDto } from "@/types/writings"
import type {
  WritingAdminTableRow,
  WritingsSearchMode,
  WritingsUiInstituteFilter,
  WritingsUiLanguageFilter,
} from "@/types/writings-ui"
import {
  deriveDistinctWriters,
  matchesWritingGenresFilter,
  matchesWritingInstituteFilter,
  matchesWritingLanguageFilter,
  matchesWritingTopicFilter,
  matchesWritingWriterFilter,
  toWritingAdminRow,
} from "@/types/writings-ui"

function ListSkeleton({ viewMode }: { viewMode: WritingsViewMode }) {
  if (viewMode === "shelf") {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
        ))}
      </div>
    )
  }
  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <div className="bg-muted/30 flex gap-2 px-3 py-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded" />
        ))}
      </div>
      <div className="divide-border/60 divide-y">
        {Array.from({ length: 6 }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-3 px-3 py-3">
            <Skeleton className="h-12 w-8 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-full max-w-md" />
              <Skeleton className="h-3 w-full max-w-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WritingsListClient() {
  return (
    <Suspense fallback={<ListSkeleton viewMode="shelf" />}>
      <WritingsListClientInner />
    </Suspense>
  )
}

function WritingsListClientInner() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const sp = useSearchParams()
  const urlTopic = sp.get("topic")

  const [viewMode, setViewMode] = useState<WritingsViewMode>("shelf")
  useEffect(() => {
    setViewMode(getStoredViewMode())
  }, [])

  const [searchRaw, setSearchRaw] = useState("")
  const debouncedKw = useDebouncedValue(searchRaw.trim(), 300)
  const [searchMode, setSearchMode] = useState<WritingsSearchMode>("writer")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: "sortCreated", desc: true },
  ])

  const [writerFilter, setWriterFilter] = useState<string | null>(null)
  const [genresFilter, setGenresFilter] = useState<BookGenre[]>([])
  const [topicId, setTopicId] = useState<number | null>(
    urlTopic && Number.isFinite(Number(urlTopic)) ? Number(urlTopic) : null,
  )
  const [language, setLanguage] = useState<WritingsUiLanguageFilter>("all")
  const [institute, setInstitute] = useState<WritingsUiInstituteFilter>("all")
  const [deleteTarget, setDeleteTarget] = useState<WritingAdminTableRow | null>(
    null,
  )

  useEffect(() => {
    if (urlTopic && Number.isFinite(Number(urlTopic))) {
      setTopicId(Number(urlTopic))
    }
  }, [urlTopic])

  const listQuery = useWritingsListQuery({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    keyword: debouncedKw,
    searchMode,
    topicId,
    languageFilter: language,
  })

  const topicsQuery = useWritingTopicsQuery()
  const topics = topicsQuery.data ?? []

  const rawRows = useMemo(
    () => listQuery.data?.content ?? [],
    [listQuery.data],
  )

  const recordCount = listQuery.data?.totalElements ?? 0

  const writerOptions = useMemo(() => deriveDistinctWriters(rawRows), [rawRows])

  const filtered = useMemo(() => {
    return rawRows.filter((r) => {
      if (!matchesWritingTopicFilter(r, topicId)) return false
      if (!matchesWritingLanguageFilter(r, language)) return false
      if (!matchesWritingInstituteFilter(r, institute)) return false
      if (!matchesWritingGenresFilter(r, genresFilter)) return false
      if (!matchesWritingWriterFilter(r, writerFilter)) return false
      return true
    })
  }, [
    debouncedKw,
    genresFilter,
    institute,
    language,
    rawRows,
    topicId,
    writerFilter,
  ])

  const gridRows = useMemo(
    () => filtered.map((r) => toWritingAdminRow(r)),
    [filtered],
  )

  const deleteMut = useDeleteWritingMutation()

  const showReset =
    searchRaw.trim().length > 0 ||
    searchMode !== "writer" ||
    writerFilter != null ||
    genresFilter.length > 0 ||
    topicId != null ||
    language !== "all" ||
    institute !== "all"

  const noExtraFilters =
    searchMode === "writer" &&
    writerFilter == null &&
    genresFilter.length === 0 &&
    topicId == null &&
    language === "all" &&
    institute === "all" &&
    searchRaw.trim() === ""

  useEffect(() => {
    queueMicrotask(() => {
      setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }))
    })
  }, [
    debouncedKw,
    searchMode,
    writerFilter,
    genresFilter,
    topicId,
    language,
    institute,
  ])

  const onResetFilters = () => {
    setSearchRaw("")
    setSearchMode("writer")
    setWriterFilter(null)
    setGenresFilter([])
    setTopicId(null)
    setLanguage("all")
    setInstitute("all")
    router.replace("/dashboard/writings")
  }

  const seedDetailCache = useCallback(
    (row: WritingDto) => {
      if (row.id == null) return
      queryClient.setQueryData(writingsKeys.detail(row.id), row)
    },
    [queryClient],
  )

  const onView = (row: WritingAdminTableRow) => {
    if (row.id == null) return
    seedDetailCache(row)
    router.push(`/dashboard/writings/${row.id}`)
  }

  const onEdit = (row: WritingAdminTableRow) => {
    if (row.id == null) return
    seedDetailCache(row)
    router.push(`/dashboard/writings/${row.id}/edit`)
  }

  const isLoading = listQuery.isLoading || listQuery.isFetching

  const showNoWritingsEmpty =
    !isLoading &&
    gridRows.length === 0 &&
    rawRows.length === 0 &&
    noExtraFilters &&
    debouncedKw.trim() === ""

  function changeViewMode(mode: WritingsViewMode) {
    setViewMode(mode)
    setStoredViewMode(mode)
  }

  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <WritingBreadcrumbBar
        className="mb-3"
        segments={[
          {
            label: NS.breadcrumb.dashboard,
            href: dashboardWritingsCrumbHref(),
          },
          { label: NS.page.title },
        ]}
      />

      <header className="border-border/60 flex flex-col gap-6 border-b pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {NS.page.title}
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            {NS.page.subtitle}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {NS.total.count(formatCkbDigits(recordCount))}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/writings/topics"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
          >
            <Cog6ToothIcon className="size-4" aria-hidden />
            {NS.topics.link}
          </Link>
          <Link
            href="/dashboard/writings/series"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
          >
            <RectangleStackIcon className="size-4" aria-hidden />
            {NS.series.link}
          </Link>
          <Link
            href="/dashboard/writings/new"
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
            title={NS.view_mode.shelf}
            onClick={() => changeViewMode("shelf")}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-md transition-colors",
              viewMode === "shelf"
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

      <WritingsFiltersToolbar
        search={searchRaw}
        onSearchChange={setSearchRaw}
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
        writer={writerFilter}
        writers={writerOptions}
        onWriterChange={setWriterFilter}
        genres={genresFilter}
        onGenresChange={setGenresFilter}
        topicId={topicId}
        topics={topics}
        onTopicChange={setTopicId}
        language={language}
        onLanguageChange={setLanguage}
        institute={institute}
        onInstituteChange={setInstitute}
        showReset={showReset}
        onReset={onResetFilters}
      />

      {listQuery.isError ? (
        <WritingErrorState onRetry={() => void listQuery.refetch()} />
      ) : isLoading ? (
        <ListSkeleton viewMode={viewMode} />
      ) : gridRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {showNoWritingsEmpty ? (
            <>
              <BookOpenIcon
                className="text-muted-foreground/40 mb-4 size-12"
                aria-hidden
              />
              <h2 className="text-foreground mb-2 text-base font-medium">
                {NS.empty.no_writings.title}
              </h2>
              <p className="text-muted-foreground mb-4 max-w-md text-sm">
                {NS.empty.no_writings.subtitle}
              </p>
              <Link
                href="/dashboard/writings/new"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "gap-1.5",
                )}
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
      ) : viewMode === "shelf" ? (
        <WritingsShelfGrid
          rows={gridRows}
          onView={onView}
          onEdit={onEdit}
          onDelete={setDeleteTarget}
        />
      ) : (
        <WritingsDataGrid
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

      <WritingDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
        target={deleteTarget}
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
