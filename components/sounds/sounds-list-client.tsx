"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { PaginationState, SortingState } from "@tanstack/react-table"
import { toast } from "sonner"
import {
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"

import {
  SoundBreadcrumbBar,
  dashboardSoundsCrumbHref,
} from "@/components/sounds/sound-breadcrumb"
import { SoundDeleteDialog } from "@/components/sounds/sound-delete-dialog"
import { SoundsDataGrid } from "@/components/sounds/sounds-data-grid"
import { SoundsFiltersToolbar } from "@/components/sounds/sounds-filters"
import { SoundsErrorState } from "@/components/sounds/sound-error-state"
import { NS } from "@/components/sounds/sounds-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  useDeleteSoundMutation,
  useSoundTopicsQuery,
  useSoundsListQuery,
} from "@/hooks/useSounds"
import { soundKeys } from "@/lib/sounds-query-keys"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { toastError } from "@/lib/toast"
import type { SoundDto } from "@/types/sounds"
import type {
  SoundAdminTableRow,
  SoundsUiLanguageFilter,
  SoundsUiStateFilter,
} from "@/types/sounds-ui"
import {
  deriveDistinctSoundTypes,
  matchesSoundLanguageFilter,
  toSoundAdminRow,
} from "@/types/sounds-ui"

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
              <Skeleton className="size-12 shrink-0 rounded-md" />
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

export function SoundsListClient() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <SoundsListClientInner />
    </Suspense>
  )
}

function SoundsListClientInner() {
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
    { id: "sortCreated", desc: true },
  ])

  const [stateFilter, setStateFilter] = useState<SoundsUiStateFilter>("all")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [topicId, setTopicId] = useState<number | null>(
    urlTopic ? Number(urlTopic) : null,
  )
  const [language, setLanguage] = useState<SoundsUiLanguageFilter>("all")
  const [deleteTarget, setDeleteTarget] = useState<SoundAdminTableRow | null>(
    null,
  )

  useEffect(() => {
    if (urlTopic && Number.isFinite(Number(urlTopic))) {
      setTopicId(Number(urlTopic))
    }
  }, [urlTopic])

  const listQuery = useSoundsListQuery({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    keyword: debouncedKw,
    stateFilter,
    typeFilter,
    topicId,
    languageFilter: language,
  })

  const topicsQuery = useSoundTopicsQuery()
  const topics = topicsQuery.data ?? []

  const rawRows = useMemo(
    () => listQuery.data?.content ?? [],
    [listQuery.data],
  )

  const recordCount = listQuery.data?.totalElements ?? 0

  const typeOptions = useMemo(() => deriveDistinctSoundTypes(rawRows), [rawRows])

  const filtered = useMemo(() => {
    return rawRows.filter((r) => {
      if (!matchesSoundLanguageFilter(r, language)) return false
      return true
    })
  }, [language, rawRows])

  const gridRows = useMemo(
    () => filtered.map((r) => toSoundAdminRow(r)),
    [filtered],
  )

  const deleteMut = useDeleteSoundMutation()

  const showReset =
    searchRaw.trim().length > 0 ||
    stateFilter !== "all" ||
    typeFilter != null ||
    topicId != null ||
    language !== "all"

  const noExtraFilters =
    stateFilter === "all" &&
    typeFilter == null &&
    topicId == null &&
    language === "all" &&
    searchRaw.trim() === ""

  useEffect(() => {
    queueMicrotask(() => {
      setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }))
    })
  }, [debouncedKw, stateFilter, typeFilter, topicId, language])

  const onResetFilters = () => {
    setSearchRaw("")
    setStateFilter("all")
    setTypeFilter(null)
    setTopicId(null)
    setLanguage("all")
    router.replace("/dashboard/sounds")
  }

  const seedDetailCache = useCallback(
    (row: SoundDto) => {
      if (row.id == null) return
      queryClient.setQueryData(soundKeys.detail(row.id), row)
    },
    [queryClient],
  )

  const onView = (row: SoundAdminTableRow) => {
    if (row.id == null) return
    seedDetailCache(row)
    router.push(`/dashboard/sounds/${row.id}`)
  }

  const onEdit = (row: SoundAdminTableRow) => {
    if (row.id == null) return
    seedDetailCache(row)
    router.push(`/dashboard/sounds/${row.id}/edit`)
  }

  const isLoading = listQuery.isLoading || listQuery.isFetching

  const showNoSoundsEmpty =
    !isLoading &&
    gridRows.length === 0 &&
    rawRows.length === 0 &&
    noExtraFilters &&
    debouncedKw.trim() === ""

  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <SoundBreadcrumbBar
        className="mb-3"
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardSoundsCrumbHref() },
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
            href="/dashboard/sounds/topics"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
          >
            <Cog6ToothIcon className="size-4" aria-hidden />
            {NS.topics.link}
          </Link>
          <Link
            href="/dashboard/sounds/new"
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

      <SoundsFiltersToolbar
        search={searchRaw}
        onSearchChange={setSearchRaw}
        stateFilter={stateFilter}
        onStateChange={setStateFilter}
        typeFilter={typeFilter}
        typeOptions={typeOptions}
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
        <SoundsErrorState onRetry={() => void listQuery.refetch()} />
      ) : !isLoading && gridRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {showNoSoundsEmpty ? (
            <>
              <MusicalNoteIcon
                className="text-muted-foreground/40 mb-4 size-12"
                aria-hidden
              />
              <h2 className="text-foreground mb-2 text-base font-medium">
                {NS.empty.no_sounds.title}
              </h2>
              <p className="text-muted-foreground mb-4 max-w-md text-sm">
                {NS.empty.no_sounds.subtitle}
              </p>
              <Link
                href="/dashboard/sounds/new"
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
        <SoundsDataGrid
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

      <SoundDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
        target={
          deleteTarget
            ? {
                id: deleteTarget.id,
                trackState: deleteTarget.trackState,
                albumOfMemories: deleteTarget.albumOfMemories,
                ckbCoverUrl: deleteTarget.ckbCoverUrl,
                totalDurationSeconds: deleteTarget.totalDurationSeconds,
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
