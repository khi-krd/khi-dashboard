"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { PaginationState, SortingState } from "@tanstack/react-table"
import { toast } from "sonner"
import {
  Cog6ToothIcon,
  FilmIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"

import {
  VideoBreadcrumbBar,
  dashboardVideosCrumbHref,
} from "@/components/videos/video-breadcrumb"
import { VideoDeleteDialog } from "@/components/videos/video-delete-dialog"
import { VideosDataGrid } from "@/components/videos/videos-data-grid"
import { VideosFiltersToolbar } from "@/components/videos/videos-filters"
import { VideosErrorState } from "@/components/videos/video-error-state"
import { NS } from "@/components/videos/videos-strings"
import { NS as FEATURED_NS } from "@/components/featured/featured-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  useDeleteVideoMutation,
  useVideoTopicsQuery,
  useVideosListQuery,
} from "@/hooks/useVideos"
import { videoKeys } from "@/lib/videos-query-keys"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { toastError } from "@/lib/toast"
import type { VideoDto } from "@/types/videos"
import type {
  VideoAdminTableRow,
  VideosUiLanguageFilter,
  VideosUiTypeFilter,
} from "@/types/videos-ui"
import {
  matchesVideoClientSearchFilter,
  matchesVideoLanguageFilter,
  matchesVideoTopicFilter,
  matchesVideoTypeFilter,
  toVideoAdminRow,
} from "@/types/videos-ui"

function ListSkeleton() {
  return (
    <div dir="rtl" className="space-y-4 py-6">
      <div className="border-border overflow-hidden rounded-lg border">
        <div className="bg-muted/30 flex gap-2 px-3 py-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1 rounded" />
          ))}
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-3 px-3 py-3">
              <Skeleton className="h-10 w-14 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-full max-w-md" />
                <Skeleton className="h-3 w-full max-w-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function VideosListClient() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <VideosListClientInner />
    </Suspense>
  )
}

function VideosListClientInner() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const sp = useSearchParams()
  const urlTopic = sp.get("topic")

  const [searchRaw, setSearchRaw] = useState("")
  const debouncedKw = useDebouncedValue(searchRaw.trim(), 300)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: "publishDate", desc: true },
  ])

  const [typeFilter, setTypeFilter] = useState<VideosUiTypeFilter>("all")
  const [topicId, setTopicId] = useState<number | null>(
    urlTopic ? Number(urlTopic) : null,
  )
  const [language, setLanguage] = useState<VideosUiLanguageFilter>("all")
  const [deleteTarget, setDeleteTarget] = useState<VideoAdminTableRow | null>(
    null,
  )

  useEffect(() => {
    if (urlTopic && Number.isFinite(Number(urlTopic))) {
      setTopicId(Number(urlTopic))
    }
  }, [urlTopic])

  const searchMode = debouncedKw.startsWith("#") ? ("keyword" as const) : "default"

  const listQuery = useVideosListQuery({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    keyword: debouncedKw,
    searchMode,
  })

  const topicsQuery = useVideoTopicsQuery()
  const topics = topicsQuery.data ?? []

  const rawRows = useMemo(
    () => listQuery.data?.content ?? [],
    [listQuery.data],
  )

  const recordCount = listQuery.data?.totalElements ?? 0

  const filtered = useMemo(() => {
    return rawRows.filter((r) => {
      if (!matchesVideoTypeFilter(r, typeFilter)) return false
      if (!matchesVideoTopicFilter(r, topicId)) return false
      if (!matchesVideoLanguageFilter(r, language)) return false
      if (
        debouncedKw.length >= 2 &&
        searchMode === "default" &&
        !debouncedKw.startsWith("#")
      ) {
        if (!matchesVideoClientSearchFilter(r, debouncedKw)) return false
      }
      return true
    })
  }, [debouncedKw, language, rawRows, searchMode, topicId, typeFilter])

  const gridRows = useMemo(
    () => filtered.map((r) => toVideoAdminRow(r)),
    [filtered],
  )

  const deleteMut = useDeleteVideoMutation()

  const showReset =
    searchRaw.trim().length > 0 ||
    typeFilter !== "all" ||
    topicId != null ||
    language !== "all"

  const noExtraFilters =
    typeFilter === "all" &&
    topicId == null &&
    language === "all" &&
    searchRaw.trim() === ""

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
    router.replace("/dashboard/videos")
  }

  const seedDetailCache = useCallback(
    (row: VideoDto) => {
      if (row.id == null) return
      queryClient.setQueryData(videoKeys.detail(row.id), row)
    },
    [queryClient],
  )

  const onView = (row: VideoAdminTableRow) => {
    if (row.id == null) return
    seedDetailCache(row)
    router.push(`/dashboard/videos/${row.id}`)
  }

  const onEdit = (row: VideoAdminTableRow) => {
    if (row.id == null) return
    seedDetailCache(row)
    router.push(`/dashboard/videos/${row.id}/edit`)
  }

  const isLoading = listQuery.isLoading || listQuery.isFetching

  const showNoVideosEmpty =
    !isLoading &&
    gridRows.length === 0 &&
    rawRows.length === 0 &&
    noExtraFilters &&
    debouncedKw.trim() === ""

  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <VideoBreadcrumbBar
        className="mb-3"
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardVideosCrumbHref() },
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
            {NS.list.totalCount(formatCkbDigits(recordCount))}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/featured"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
          >
            <SparklesIcon className="size-4" aria-hidden />
            {FEATURED_NS.actions.manage_link}
          </Link>
          <Link
            href="/dashboard/videos/topics"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
          >
            <Cog6ToothIcon className="size-4" aria-hidden />
            {NS.topics.link}
          </Link>
          <Link
            href="/dashboard/videos/new"
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

      <VideosFiltersToolbar
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
        <VideosErrorState onRetry={() => void listQuery.refetch()} />
      ) : !isLoading && gridRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {showNoVideosEmpty ? (
            <>
              <FilmIcon
                className="text-muted-foreground/40 mb-4 size-12"
                aria-hidden
              />
              <h2 className="text-foreground mb-2 text-base font-medium">
                {NS.empty.no_videos.title}
              </h2>
              <p className="text-muted-foreground mb-4 max-w-md text-sm">
                {NS.empty.no_videos.subtitle}
              </p>
              <Link
                href="/dashboard/videos/new"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "mt-4 inline-flex items-center gap-1.5",
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
      ) : (
        <VideosDataGrid
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
          onDeleteOne={(row) => setDeleteTarget(row)}
        />
      )}

      <VideoDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
        target={
          deleteTarget
            ? {
                id: deleteTarget.id,
                videoType: deleteTarget.videoType,
                albumOfMemories: deleteTarget.albumOfMemories,
                ckbCoverUrl: deleteTarget.ckbCoverUrl,
                durationSeconds: deleteTarget.durationSeconds,
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
