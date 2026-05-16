"use client"

import { Suspense } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { PaginationState, SortingState } from "@tanstack/react-table"
import { toast } from "sonner"

import { MagnifyingGlassIcon, NewspaperIcon, PlusIcon } from "@heroicons/react/24/outline"

import type { NewsCategoryFilterOption } from "@/components/news/news-filters"
import { NewsFiltersToolbar } from "@/components/news/news-filters"
import {
  dashboardNewsCrumbHref,
  NewsBreadcrumbBar,
} from "@/components/news/news-breadcrumb"
import { NewsDataGrid, type NewsAdminTableRow } from "@/components/news/news-data-grid"
import { NewsDeleteDialog } from "@/components/news/news-delete-dialog"
import { NewsErrorState } from "@/components/news/news-error-state"
import { NS } from "@/components/news/news-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  useBulkDeleteNewsMutation,
  useDeleteNewsMutation,
  useNewsListQuery,
} from "@/hooks/useNews"
import { useNewsDerivedCategories } from "@/hooks/useNewsDerivedTaxonomy"
import { mergeNewsDerivedTaxonomy } from "@/lib/news-derived-cache"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { toastError } from "@/lib/toast"
import type {
  NewsUiLanguageFilter,
  NewsUiStatusFilter,
} from "@/types/news-ui"
import {
  deriveCategoryOptions,
  matchesNewsCategoryFilter,
  matchesNewsClientKeywordFilter,
  matchesNewsClientTagFilter,
  matchesNewsLanguageFilter,
  matchesNewsStatusFilter,
  matchesNewsSubcategoryFilter,
} from "@/types/news-ui"
import type { NewsDto } from "@/types/news"

function toAdminRow(dto: NewsDto): NewsAdminTableRow {
  const titleCkb = dto.ckbContent?.title ?? ""
  const titleKmr = dto.kmrContent?.title ?? ""
  const t = dto.datePublished
    ? new Date(dto.datePublished).getTime()
    : dto.createdAt
      ? new Date(dto.createdAt).getTime()
      : 0
  return {
    ...dto,
    titleCkb,
    titleKmr,
    sortPublishedAt: Number.isFinite(t) ? t : 0,
  }
}

function NewsListSuspenseFallback() {
  return (
    <div dir="rtl" className="space-y-4 py-6">
      <div className="border-border overflow-hidden rounded-lg border">
        <div className="bg-muted/30 flex gap-2 px-3 py-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1 rounded" />
          ))}
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="flex items-center gap-3 px-3 py-3"
            >
              <Skeleton className="size-10 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-full max-w-md" />
                <Skeleton className="h-3 w-full max-w-sm" />
              </div>
              <div className="hidden w-44 shrink-0 flex-col gap-1.5 sm:flex">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
              <div className="hidden w-24 shrink-0 justify-center gap-1 md:flex">
                <Skeleton className="h-4 w-8 rounded" />
                <Skeleton className="h-4 w-8 rounded" />
              </div>
              <Skeleton className="hidden h-3 w-16 shrink-0 font-mono sm:block" />
              <div className="flex shrink-0 justify-center gap-1">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function NewsListClient() {
  return (
    <Suspense fallback={<NewsListSuspenseFallback />}>
      <NewsListClientInner />
    </Suspense>
  )
}

function NewsListClientInner() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const sp = useSearchParams()
  const urlTag = sp.get("tag")
  const urlKeyword = sp.get("keyword")

  const [searchRaw, setSearchRaw] = useState("")
  const debouncedKw = useDebouncedValue(searchRaw.trim(), 300)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: "publishedOn", desc: true },
  ])

  const [status, setStatus] = useState<NewsUiStatusFilter>("all")
  const [language, setLanguage] = useState<NewsUiLanguageFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [subcategoryFilter, setSubcategoryFilter] = useState<string | null>(null)

  const [hiddenIds, setHiddenIds] = useState<Set<number>>(() => new Set())

  const deleteTimers = useRef<
    Map<number, ReturnType<typeof globalThis.setTimeout>>
  >(new Map())

  const bulkTimer = useRef<{
    ids: number[]
    timeout: ReturnType<typeof globalThis.setTimeout>
  } | null>(null)

  const [deleteDlg, setDeleteDlg] = useState<
    | { mode: "single"; item: NewsAdminTableRow }
    | {
        mode: "bulk"
        items: Array<
          Pick<NewsDto, "id" | "coverUrl"> & { titleCkb?: string | null }
        >
      }
    | null
  >(null)

  const listQuery = useNewsListQuery({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    keyword: debouncedKw,
  })

  const apiEnvelope = listQuery.data

  const rawRows = useMemo(
    () =>
      apiEnvelope?.success === true && apiEnvelope.data
        ? (apiEnvelope.data.content ?? [])
        : ([] as NewsDto[]),
    [apiEnvelope],
  )

  useEffect(() => {
    mergeNewsDerivedTaxonomy(queryClient, rawRows)
  }, [queryClient, rawRows])

  const searchKey = sp.toString()
  useEffect(() => {
    const cat = sp.get("category")
    const sub = sp.get("subcategory")
    if (sp.has("category")) {
      setCategoryFilter(cat?.trim() ? cat.trim() : null)
    }
    if (sp.has("subcategory")) {
      setSubcategoryFilter(sub?.trim() ? sub.trim() : null)
    }
  }, [searchKey, sp])

  const recordCount =
    apiEnvelope?.success === true && apiEnvelope.data
      ? (apiEnvelope.data.totalElements ?? 0)
      : 0

  const catsFromCache = useNewsDerivedCategories()

  const categoryFilterOptions = useMemo<NewsCategoryFilterOption[]>(() => {
    const map = new Map<string, NewsCategoryFilterOption>()
    for (const c of catsFromCache.data ?? []) {
      if (!c.ckbName?.trim()) continue
      map.set(c.ckbName.trim(), {
        label: `${c.ckbName} — ${c.kmrName?.trim() ? c.kmrName : NS.dash}`,
        value: c.ckbName.trim(),
      })
    }
    for (const c of deriveCategoryOptions(rawRows)) {
      map.set(c.ckbName, {
        label: `${c.ckbName} — ${c.kmrName.trim() ? c.kmrName : NS.dash}`,
        value: c.ckbName,
      })
    }
    return [...map.values()].sort((a, b) =>
      (a.value ?? "").localeCompare(b.value ?? "", "ckb"),
    )
  }, [catsFromCache.data, rawRows])

  const filtered = useMemo(() => {
    return rawRows.filter((r) => {
      if (r.id != null && hiddenIds.has(r.id)) return false
      if (!matchesNewsStatusFilter(r, status)) return false
      if (!matchesNewsLanguageFilter(r, language)) return false
      if (!matchesNewsCategoryFilter(r, categoryFilter)) return false
      if (!matchesNewsSubcategoryFilter(r, subcategoryFilter)) return false
      if (!matchesNewsClientTagFilter(r, urlTag)) return false
      if (!matchesNewsClientKeywordFilter(r, urlKeyword)) return false
      return true
    })
  }, [
    categoryFilter,
    hiddenIds,
    language,
    rawRows,
    status,
    subcategoryFilter,
    urlKeyword,
    urlTag,
  ])

  const gridRows = useMemo(
    () => filtered.map((r) => toAdminRow(r)),
    [filtered],
  )

  const deleteMut = useDeleteNewsMutation()
  const bulkDeleteMut = useBulkDeleteNewsMutation()

  const clearSingleTimer = useCallback((id: number) => {
    const t = deleteTimers.current.get(id)
    if (t) globalThis.clearTimeout(t)
    deleteTimers.current.delete(id)
  }, [])

  const clearBulkTimer = useCallback(() => {
    const b = bulkTimer.current
    if (b) globalThis.clearTimeout(b.timeout)
    bulkTimer.current = null
  }, [])

  const revealIds = useCallback((ids: number[]) => {
    setHiddenIds((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.delete(id)
      return next
    })
  }, [])

  const scheduleSingleDelete = useCallback(
    (id: number) => {
      setHiddenIds((prev) => new Set(prev).add(id))
      clearSingleTimer(id)
      const toastId = toast(NS.toast.deleted, {
        duration: 5000,
        action: {
          label: NS.toast.undo,
          onClick: () => {
            clearSingleTimer(id)
            revealIds([id])
            toast.dismiss(toastId)
          },
        },
      })
      const timeout = globalThis.setTimeout(() => {
        deleteTimers.current.delete(id)
        deleteMut.mutate(id, {
          onError: () => {
            revealIds([id])
            toastError(NS.error.generic)
          },
        })
      }, 5000)
      deleteTimers.current.set(id, timeout)
    },
    [clearSingleTimer, deleteMut, revealIds],
  )

  const scheduleBulkDelete = useCallback(
    (ids: number[]) => {
      clearBulkTimer()
      setHiddenIds((prev) => {
        const next = new Set(prev)
        ids.forEach((i) => next.add(i))
        return next
      })
      const msg = NS.toast.bulk_deleted(formatCkbDigits(ids.length))
      const bulkToastId = toast(msg, {
        duration: 5000,
        action: {
          label: NS.toast.undo,
          onClick: () => {
            clearBulkTimer()
            revealIds(ids)
            toast.dismiss(bulkToastId)
          },
        },
      })
      bulkTimer.current = {
        ids,
        timeout: globalThis.setTimeout(() => {
          bulkTimer.current = null
          bulkDeleteMut.mutate(ids, {
            onError: () => {
              revealIds(ids)
              toastError(NS.error.generic)
            },
          })
        }, 5000),
      }
    },
    [bulkDeleteMut, clearBulkTimer, revealIds],
  )

  const showReset =
    searchRaw.trim().length > 0 ||
    status !== "all" ||
    language !== "all" ||
    categoryFilter != null ||
    subcategoryFilter != null ||
    Boolean(urlTag?.trim()) ||
    Boolean(urlKeyword?.trim())

  const noExtraListFilters =
    status === "all" &&
    language === "all" &&
    categoryFilter == null &&
    subcategoryFilter == null &&
    !urlTag?.trim() &&
    !urlKeyword?.trim() &&
    searchRaw.trim() === ""

  useEffect(() => {
    queueMicrotask(() => {
      setPagination((p) =>
        p.pageIndex === 0 ? p : { ...p, pageIndex: 0 },
      )
    })
  }, [debouncedKw, status, language, categoryFilter, subcategoryFilter, urlTag, urlKeyword])

  const onResetFilters = () => {
    setSearchRaw("")
    setStatus("all")
    setLanguage("all")
    setCategoryFilter(null)
    setSubcategoryFilter(null)
    router.replace("/dashboard/news")
  }

  const onView = (row: NewsAdminTableRow) => {
    if (row.id == null) return
    router.push(`/dashboard/news/${row.id}`)
  }

  const onEdit = (row: NewsAdminTableRow) => {
    if (row.id == null) return
    router.push(`/dashboard/news/${row.id}/edit`)
  }

  const isLoading = listQuery.isLoading || listQuery.isFetching

  const showNoNewsEmpty =
    !isLoading &&
    gridRows.length === 0 &&
    rawRows.length === 0 &&
    noExtraListFilters &&
    debouncedKw.trim() === ""

  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <NewsBreadcrumbBar
        className="mb-3"
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardNewsCrumbHref() },
          { label: NS.page.title },
        ]}
      />

      <div className="border-border/60 border-b pb-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              {NS.page.title}
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm">
              {NS.page.subtitle}
            </p>
          </div>
          <Link
            href="/dashboard/news/new"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "inline-flex items-center gap-1.5",
            )}
          >
            <PlusIcon className="size-4 rtl:rotate-180" aria-hidden />
            {NS.action.new}
          </Link>
        </header>
        <p className="text-muted-foreground mt-4 text-xs">
          {NS.list.totalCount(formatCkbDigits(recordCount))}
        </p>
      </div>

      <NewsFiltersToolbar
        search={searchRaw}
        onSearchChange={setSearchRaw}
        status={status}
        onStatusChange={setStatus}
        language={language}
        onLanguageChange={setLanguage}
        category={categoryFilter}
        categoryOptions={categoryFilterOptions}
        onCategoryChange={setCategoryFilter}
        showReset={showReset}
        onReset={onResetFilters}
      />

      {listQuery.isError ? (
        <NewsErrorState onRetry={() => void listQuery.refetch()} />
      ) : !isLoading && gridRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {showNoNewsEmpty ? (
            <>
              <NewspaperIcon
                className="text-muted-foreground/40 mb-4 size-12"
                aria-hidden
              />
              <h2 className="text-foreground mb-2 text-base font-medium">
                {NS.empty.no_news.title}
              </h2>
              <p className="text-muted-foreground mb-4 max-w-md text-sm">
                {NS.empty.no_news.subtitle}
              </p>
              <Link
                href="/dashboard/news/new"
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "mt-4 inline-flex items-center gap-1.5",
                )}
              >
                <PlusIcon className="size-4 rtl:rotate-180" aria-hidden />
                {NS.action.new}
              </Link>
            </>
          ) : (
            <>
              <MagnifyingGlassIcon
                className="text-muted-foreground/40 mb-4 size-12 rtl:rotate-180"
                aria-hidden
              />
              <h2 className="text-foreground mb-2 text-base font-medium">
                {NS.empty.no_results.title}
              </h2>
              <p className="text-muted-foreground mb-4 max-w-md text-sm">
                {NS.empty.no_results.subtitle}
              </p>
              <Button
                type="button"
                variant="ghost"
                className="mt-4"
                onClick={onResetFilters}
              >
                {NS.empty.no_results.cta}
              </Button>
            </>
          )}
        </div>
      ) : (
        <NewsDataGrid
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
          onDeleteOne={(row) => {
            if (row.id == null) return
            setDeleteDlg({ mode: "single", item: row })
          }}
        />
      )}

      <NewsDeleteDialog
        open={deleteDlg != null}
        onOpenChange={(o) => {
          if (!o) setDeleteDlg(null)
        }}
        target={deleteDlg}
        isPending={deleteMut.isPending || bulkDeleteMut.isPending}
        onConfirm={() => {
          if (!deleteDlg) return
          setDeleteDlg(null)
          if (deleteDlg.mode === "single") {
            const id = deleteDlg.item.id
            if (id == null) return
            scheduleSingleDelete(id)
            return
          }
          const ids = deleteDlg.items
            .map((i) => i.id!)
            .filter((n) => Number.isFinite(n))
          scheduleBulkDelete(ids)
        }}
      />
    </div>
  )
}
