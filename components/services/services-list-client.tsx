"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { PaginationState, RowSelectionState, SortingState } from "@tanstack/react-table"
import { toast } from "sonner"
import {
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline"

import {
  ServiceBreadcrumbBar,
  dashboardServicesCrumbHref,
} from "@/components/services/service-breadcrumb"
import {
  ServiceDeleteDialog,
  serviceToDeleteTarget,
} from "@/components/services/service-delete-dialog"
import { ServicesDataGrid } from "@/components/services/services-data-grid"
import { ServicesFiltersToolbar } from "@/components/services/services-filters"
import { ServicesErrorState } from "@/components/services/services-error-state"
import { NS } from "@/components/services/services-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  useBulkDeleteServicesMutation,
  useDeleteServiceMutation,
  useServicesListQuery,
  useServiceTypesQuery,
} from "@/hooks/useServices"
import { servicesKeys } from "@/lib/services-query-keys"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { toastError } from "@/lib/toast"
import type { ServiceDto } from "@/types/services"
import type {
  ServiceAdminTableRow,
  ServicesUiActiveFilter,
  ServicesUiStatusFilter,
} from "@/types/services-ui"
import {
  deriveServiceTypeOptions,
  matchesServicesActiveFilter,
  matchesServicesClientSearchFilter,
  matchesServicesStatusFilter,
  matchesServicesTypeFilter,
  toServiceAdminRow,
} from "@/types/services-ui"

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
            <div key={rowIdx} className="flex h-16 items-center gap-3 px-3 py-3">
              <Skeleton className="size-4 shrink-0 rounded" />
              <Skeleton className="size-10 shrink-0 rounded-md" />
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

export function ServicesListClient() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <ServicesListClientInner />
    </Suspense>
  )
}

function ServicesListClientInner() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const sp = useSearchParams()
  const urlType = sp.get("type")

  const [searchRaw, setSearchRaw] = useState("")
  const debouncedKw = useDebouncedValue(searchRaw.trim(), 300)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: "publishedAt", desc: true },
  ])

  const [status, setStatus] = useState<ServicesUiStatusFilter>("all")
  const [activeFilter, setActiveFilter] = useState<ServicesUiActiveFilter>("all")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const [deleteDlg, setDeleteDlg] = useState<
    | { mode: "single"; item: ReturnType<typeof serviceToDeleteTarget> }
    | {
        mode: "bulk"
        items: Array<ReturnType<typeof serviceToDeleteTarget>>
      }
    | null
  >(null)

  useEffect(() => {
    if (urlType?.trim()) setTypeFilter(urlType.trim())
  }, [urlType])

  const listQuery = useServicesListQuery({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    keyword: debouncedKw,
  })

  const typesQuery = useServiceTypesQuery()

  const apiEnvelope = listQuery.data
  const rawRows = useMemo(
    () =>
      apiEnvelope?.success === true && apiEnvelope.data
        ? (apiEnvelope.data.content ?? [])
        : ([] as ServiceDto[]),
    [apiEnvelope],
  )

  const recordCount =
    apiEnvelope?.success === true && apiEnvelope.data
      ? (apiEnvelope.data.totalElements ?? 0)
      : 0

  const typeOptions = useMemo(
    () => deriveServiceTypeOptions(rawRows, typesQuery.data ?? []),
    [rawRows, typesQuery.data],
  )

  const filtered = useMemo(() => {
    return rawRows.filter((r) => {
      if (!matchesServicesStatusFilter(r, status)) return false
      if (!matchesServicesActiveFilter(r, activeFilter)) return false
      if (!matchesServicesTypeFilter(r, typeFilter)) return false
      if (debouncedKw.length >= 2) {
        if (!matchesServicesClientSearchFilter(r, debouncedKw)) return false
      }
      return true
    })
  }, [activeFilter, debouncedKw, rawRows, status, typeFilter])

  const gridRows = useMemo(
    () => filtered.map((r) => toServiceAdminRow(r)),
    [filtered],
  )

  const deleteMut = useDeleteServiceMutation()
  const bulkDeleteMut = useBulkDeleteServicesMutation()

  const selectedIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .map(Number)
        .filter((id) => Number.isFinite(id) && id > 0),
    [rowSelection],
  )

  const showReset =
    searchRaw.trim().length > 0 ||
    status !== "all" ||
    activeFilter !== "all" ||
    typeFilter != null

  const noExtraFilters =
    status === "all" &&
    activeFilter === "all" &&
    typeFilter == null &&
    searchRaw.trim() === ""

  useEffect(() => {
    queueMicrotask(() => {
      setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }))
    })
  }, [debouncedKw, status, activeFilter, typeFilter])

  const onResetFilters = () => {
    setSearchRaw("")
    setStatus("all")
    setActiveFilter("all")
    setTypeFilter(null)
    router.replace("/dashboard/services")
  }

  const seedDetailCache = useCallback(
    (row: ServiceDto) => {
      if (row.id == null) return
      queryClient.setQueryData(servicesKeys.detail(row.id), {
        success: true,
        message: "",
        data: row,
      })
    },
    [queryClient],
  )

  const onView = (row: ServiceAdminTableRow) => {
    if (row.id == null) return
    seedDetailCache(row)
    router.push(`/dashboard/services/${row.id}`)
  }

  const onEdit = (row: ServiceAdminTableRow) => {
    if (row.id == null) return
    seedDetailCache(row)
    router.push(`/dashboard/services/${row.id}/edit`)
  }

  const isLoading = listQuery.isLoading || listQuery.isFetching

  const showNoServicesEmpty =
    !isLoading &&
    gridRows.length === 0 &&
    rawRows.length === 0 &&
    noExtraFilters &&
    debouncedKw.trim() === ""

  const showNoResults =
    !isLoading &&
    gridRows.length === 0 &&
    !showNoServicesEmpty

  const handleConfirmDelete = () => {
    if (!deleteDlg) return
    if (deleteDlg.mode === "single" && deleteDlg.item.id != null) {
      deleteMut.mutate(deleteDlg.item.id, {
        onSuccess: () => {
          toast(NS.toast.deleted)
          setDeleteDlg(null)
        },
        onError: () => toastError(NS.error.generic),
      })
    } else if (deleteDlg.mode === "bulk") {
      const ids = deleteDlg.items
        .map((i) => i.id)
        .filter((id): id is number => id != null)
      bulkDeleteMut.mutate(ids, {
        onSuccess: () => {
          toast(NS.toast.bulkDeleted(formatCkbDigits(ids.length)))
          setRowSelection({})
          setDeleteDlg(null)
        },
        onError: () => toastError(NS.error.generic),
      })
    }
  }

  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <ServiceBreadcrumbBar
        className="mb-3"
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardServicesCrumbHref() },
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

        {selectedIds.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {NS.list.selectedCount(formatCkbDigits(selectedIds.length))}
            </span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                const items = gridRows
                  .filter((r) => r.id != null && selectedIds.includes(r.id))
                  .map((r) => serviceToDeleteTarget(r))
                setDeleteDlg({ mode: "bulk", items })
              }}
            >
              {NS.action.bulk_delete}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
            >
              {NS.action.bulk_cancel}
            </Button>
          </div>
        ) : (
          <Link
            href="/dashboard/services/new"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "inline-flex items-center gap-1.5",
            )}
          >
            <PlusIcon className="size-4 rtl:rotate-180" aria-hidden />
            {NS.action.new}
          </Link>
        )}
      </header>

      <ServicesFiltersToolbar
        search={searchRaw}
        onSearchChange={setSearchRaw}
        status={status}
        onStatusChange={setStatus}
        typeFilter={typeFilter}
        typeOptions={typeOptions}
        onTypeChange={setTypeFilter}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
        showReset={showReset}
        onReset={onResetFilters}
      />

      {listQuery.isError ? (
        <ServicesErrorState onRetry={() => void listQuery.refetch()} />
      ) : showNoServicesEmpty ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <Squares2X2Icon
            className="text-muted-foreground/40 size-12"
            aria-hidden
          />
          <div className="space-y-1">
            <p className="text-lg font-medium">{NS.empty.no_services.title}</p>
            <p className="text-muted-foreground text-sm">
              {NS.empty.no_services.subtitle}
            </p>
          </div>
          <Link
            href="/dashboard/services/new"
            className={buttonVariants({ variant: "default" })}
          >
            {NS.action.new}
          </Link>
        </div>
      ) : showNoResults ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <MagnifyingGlassIcon
            className="text-muted-foreground/40 size-12"
            aria-hidden
          />
          <div className="space-y-1">
            <p className="text-lg font-medium">{NS.empty.no_results.title}</p>
            <p className="text-muted-foreground text-sm">
              {NS.empty.no_results.subtitle}
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={onResetFilters}>
            {NS.empty.no_results.cta}
          </Button>
        </div>
      ) : (
        <ServicesDataGrid
          rows={gridRows}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={isLoading}
          recordCount={recordCount}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          selectable
          onView={onView}
          onEdit={onEdit}
          onDeleteOne={(row) =>
            setDeleteDlg({
              mode: "single",
              item: serviceToDeleteTarget(row),
            })
          }
        />
      )}

      <ServiceDeleteDialog
        open={deleteDlg != null}
        onOpenChange={(open) => {
          if (!open) setDeleteDlg(null)
        }}
        target={deleteDlg}
        onConfirm={handleConfirmDelete}
        isPending={deleteMut.isPending || bulkDeleteMut.isPending}
      />
    </div>
  )
}
