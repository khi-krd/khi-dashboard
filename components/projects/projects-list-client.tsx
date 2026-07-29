"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { PaginationState, SortingState } from "@tanstack/react-table"
import { toast } from "sonner"
import {
  BriefcaseIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"

import {
  ProjectBreadcrumbBar,
  dashboardProjectsCrumbHref,
} from "@/components/projects/project-breadcrumb"
import { useSyncedState } from "@/hooks/use-synced-state"
import { ProjectDeleteDialog } from "@/components/projects/project-delete-dialog"
import { ProjectsDataGrid } from "@/components/projects/projects-data-grid"
import {
  ProjectsFiltersToolbar,
  type ProjectTypeFilterOption,
} from "@/components/projects/projects-filters"
import { ProjectsErrorState } from "@/components/projects/projects-error-state"
import { NS } from "@/components/projects/projects-strings"
import { NS as FEATURED_NS } from "@/components/featured/featured-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  useDeleteProjectMutation,
  useProjectsListQuery,
} from "@/hooks/useProjects"
import { useProjectsDerivedTypes } from "@/hooks/useProjectsDerivedTypes"
import { mergeProjectsDerivedTypes } from "@/lib/projects-derived-cache"
import { projectKeys } from "@/lib/projects-query-keys"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { toastError } from "@/lib/toast"
import type { ProjectDto } from "@/types/projects"
import type {
  ProjectAdminTableRow,
  ProjectsUiLanguageFilter,
  ProjectsUiStatusFilter,
} from "@/types/projects-ui"
import {
  deriveProjectTypeOptions,
  matchesProjectClientKeywordFilter,
  matchesProjectClientSearchFilter,
  matchesProjectClientTagFilter,
  matchesProjectLanguageFilter,
  matchesProjectStatusFilter,
  matchesProjectTypeFilter,
  toProjectAdminRow,
} from "@/types/projects-ui"

function ListSkeleton() {
  return (
    <div dir="rtl" className="space-y-4 py-6">
      <div className="border-border overflow-hidden rounded-lg border">
        <div className="bg-muted/30 flex gap-2 px-3 py-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1 rounded" />
          ))}
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-3 px-3 py-3">
              <Skeleton className="size-10 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-full max-w-md" />
                <Skeleton className="h-3 w-full max-w-sm" />
              </div>
              <Skeleton className="hidden h-5 w-16 lg:block" />
              <Skeleton className="hidden h-3 w-20 lg:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProjectsListClient() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <ProjectsListClientInner />
    </Suspense>
  )
}

function ProjectsListClientInner() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const sp = useSearchParams()
  const urlTag = sp.get("tag")
  const urlKeyword = sp.get("keyword")
  const urlContent = sp.get("content")

  // Seeded from ?tag= / ?keyword=, re-seeded whenever either changes. Typing in
  // the box afterwards is preserved until the URL itself moves.
  const [searchRaw, setSearchRaw] = useSyncedState(
    [urlTag, urlKeyword],
    () => urlTag?.trim() || urlKeyword?.trim() || undefined,
    () => urlTag?.trim() || urlKeyword?.trim() || "",
  )
  const debouncedKw = useDebouncedValue(searchRaw.trim(), 300)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: "projectDate", desc: true },
  ])

  const [status, setStatus] = useState<ProjectsUiStatusFilter>("all")
  const [language, setLanguage] = useState<ProjectsUiLanguageFilter>("all")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<ProjectAdminTableRow | null>(
    null,
  )

  const searchMode = urlTag?.trim()
    ? ("tag" as const)
    : urlKeyword?.trim()
      ? ("keyword" as const)
      : "default"

  const listKeyword =
    urlTag?.trim() || urlKeyword?.trim() || debouncedKw

  const listQuery = useProjectsListQuery({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    keyword: listKeyword,
    searchMode,
  })

  const apiEnvelope = listQuery.data
  const rawRows = useMemo(
    () =>
      apiEnvelope?.success === true && apiEnvelope.data
        ? (apiEnvelope.data.content ?? [])
        : ([] as ProjectDto[]),
    [apiEnvelope],
  )

  useEffect(() => {
    mergeProjectsDerivedTypes(queryClient, rawRows)
  }, [queryClient, rawRows])


  const recordCount =
    apiEnvelope?.success === true && apiEnvelope.data
      ? (apiEnvelope.data.totalElements ?? 0)
      : 0

  const typesFromCache = useProjectsDerivedTypes()

  const typeFilterOptions = useMemo<ProjectTypeFilterOption[]>(() => {
    const map = new Map<string, ProjectTypeFilterOption>()
    for (const t of typesFromCache.data ?? []) {
      if (!t.projectTypeCkb?.trim()) continue
      map.set(t.projectTypeCkb.trim(), {
        label: `${t.projectTypeCkb} — ${t.projectTypeKmr?.trim() || NS.dash}`,
        value: t.projectTypeCkb.trim(),
      })
    }
    for (const t of deriveProjectTypeOptions(rawRows)) {
      map.set(t.projectTypeCkb, {
        label: `${t.projectTypeCkb} — ${t.projectTypeKmr.trim() || NS.dash}`,
        value: t.projectTypeCkb,
      })
    }
    return [...map.values()].sort((a, b) =>
      a.value.localeCompare(b.value, "ckb"),
    )
  }, [typesFromCache.data, rawRows])

  const filtered = useMemo(() => {
    return rawRows.filter((r) => {
      if (!matchesProjectStatusFilter(r, status)) return false
      if (!matchesProjectLanguageFilter(r, language)) return false
      if (!matchesProjectTypeFilter(r, typeFilter)) return false
      if (!matchesProjectClientTagFilter(r, urlTag)) return false
      if (!matchesProjectClientKeywordFilter(r, urlKeyword)) return false
      if (
        debouncedKw.length >= 2 &&
        !urlTag?.trim() &&
        !urlKeyword?.trim() &&
        searchMode === "default"
      ) {
        if (!matchesProjectClientSearchFilter(r, debouncedKw)) return false
      }
      return true
    })
  }, [
    debouncedKw,
    language,
    rawRows,
    searchMode,
    status,
    typeFilter,
    urlContent,
    urlKeyword,
    urlTag,
  ])

  const gridRows = useMemo(
    () => filtered.map((r) => toProjectAdminRow(r)),
    [filtered],
  )

  const deleteMut = useDeleteProjectMutation()

  const showReset =
    searchRaw.trim().length > 0 ||
    status !== "all" ||
    language !== "all" ||
    typeFilter != null ||
    Boolean(urlTag?.trim()) ||
    Boolean(urlKeyword?.trim()) ||
    Boolean(urlContent?.trim())

  const noExtraFilters =
    status === "all" &&
    language === "all" &&
    typeFilter == null &&
    !urlTag?.trim() &&
    !urlKeyword?.trim() &&
    !urlContent?.trim() &&
    searchRaw.trim() === ""

  useEffect(() => {
    queueMicrotask(() => {
      setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }))
    })
  }, [debouncedKw, status, language, typeFilter, urlTag, urlKeyword, urlContent])

  const onResetFilters = () => {
    setSearchRaw("")
    setStatus("all")
    setLanguage("all")
    setTypeFilter(null)
    router.replace("/dashboard/projects")
  }

  const seedDetailCache = useCallback(
    (row: ProjectDto) => {
      if (row.id == null) return
      queryClient.setQueryData(projectKeys.detail(row.id), {
        success: true,
        message: "",
        data: row,
      })
    },
    [queryClient],
  )

  const onView = (row: ProjectAdminTableRow) => {
    if (row.id == null) return
    seedDetailCache(row)
    router.push(`/dashboard/projects/${row.id}`)
  }

  const onEdit = (row: ProjectAdminTableRow) => {
    if (row.id == null) return
    seedDetailCache(row)
    router.push(`/dashboard/projects/${row.id}/edit`)
  }

  const isLoading = listQuery.isLoading || listQuery.isFetching

  const showNoProjectsEmpty =
    !isLoading &&
    gridRows.length === 0 &&
    rawRows.length === 0 &&
    noExtraFilters &&
    debouncedKw.trim() === ""

  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <ProjectBreadcrumbBar
        className="mb-3"
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardProjectsCrumbHref() },
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
              href="/dashboard/projects/new"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "inline-flex items-center gap-1.5",
            )}
          >
            <PlusIcon className="size-4 rtl:rotate-180" aria-hidden />
            {NS.action.new}
          </Link>
          </div>
      </header>

      <ProjectsFiltersToolbar
        search={searchRaw}
        onSearchChange={setSearchRaw}
        status={status}
        onStatusChange={setStatus}
        language={language}
        onLanguageChange={setLanguage}
        typeFilter={typeFilter}
        typeOptions={typeFilterOptions}
        onTypeChange={setTypeFilter}
        showReset={showReset}
        onReset={onResetFilters}
      />

      {listQuery.isError ? (
        <ProjectsErrorState onRetry={() => void listQuery.refetch()} />
      ) : !isLoading && gridRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {showNoProjectsEmpty ? (
            <>
              <BriefcaseIcon
                className="text-muted-foreground/40 mb-4 size-12"
                aria-hidden
              />
              <h2 className="text-foreground mb-2 text-base font-medium">
                {NS.empty.no_projects.title}
              </h2>
              <p className="text-muted-foreground mb-4 max-w-md text-sm">
                {NS.empty.no_projects.subtitle}
              </p>
              <Link
                href="/dashboard/projects/new"
                className={cn(
                  buttonVariants({ variant: "default" }),
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
              <Button type="button" variant="ghost" onClick={onResetFilters}>
                {NS.empty.no_results.cta}
              </Button>
            </>
          )}
        </div>
      ) : (
        <ProjectsDataGrid
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

      <ProjectDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
        target={
          deleteTarget
            ? {
                id: deleteTarget.id,
                coverUrl: deleteTarget.coverUrl,
                status: deleteTarget.status,
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
            onSuccess: () => {
              toast(NS.toast.deleted)
            },
            onError: () => toastError(NS.error.generic),
          })
        }}
      />
    </div>
  )
}
