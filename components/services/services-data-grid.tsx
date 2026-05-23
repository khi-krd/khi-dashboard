"use client"

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  EyeIcon,
  MapPinIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { ServiceStatusPill } from "@/components/services/service-status-pill"
import { NS } from "@/components/services/services-strings"
import {
  DataGrid,
  DataGridContainer,
  useDataGrid,
} from "@/components/reui/data-grid/data-grid"
import { DataGridScrollArea } from "@/components/reui/data-grid/data-grid-scroll-area"
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/reui/data-grid/data-grid-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCkbDigits, formatNewsDateShort } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { ServiceAdminTableRow } from "@/types/services-ui"
import { serviceDisplayStatus } from "@/types/services-ui"

function TableSortLabel({
  label,
  sorted,
}: {
  label: string
  sorted?: false | "asc" | "desc"
}) {
  return (
    <span className="inline-flex cursor-pointer items-center gap-1.5">
      {label}
      {sorted === "asc" ? (
        <ChevronUpIcon className="text-muted-foreground size-3.5 shrink-0" />
      ) : sorted === "desc" ? (
        <ChevronDownIcon className="text-muted-foreground size-3.5 shrink-0" />
      ) : null}
    </span>
  )
}

function StackedBilingualCell({
  primary,
  secondary,
}: {
  primary?: string | null
  secondary?: string | null
}) {
  const top = primary?.trim()
  const bottom = secondary?.trim()
  return (
    <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
      <span className="text-foreground line-clamp-2 font-medium">
        {top || NS.dash}
      </span>
      {bottom ? (
        <span className="text-muted-foreground line-clamp-1 text-xs">
          {bottom}
        </span>
      ) : (
        <span className="text-muted-foreground/60 text-xs">{NS.dash}</span>
      )}
    </div>
  )
}

function ServicesListPaginationFooter() {
  const { table, recordCount, isLoading } = useDataGrid()
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()
  const from =
    recordCount === 0 || !Number.isFinite(recordCount)
      ? 0
      : pageIndex * pageSize + 1
  const to =
    recordCount === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, recordCount)
  const rangeText = NS.list.paginationRange(
    formatCkbDigits(from),
    formatCkbDigits(to),
    formatCkbDigits(recordCount),
  )
  const showPageNav = recordCount > pageSize

  if (isLoading) {
    return (
      <div className="border-border/60 flex items-center justify-between border-t px-2 py-3">
        <Skeleton className="h-4 w-40" aria-hidden />
      </div>
    )
  }

  return (
    <div className="border-border/60 flex flex-wrap items-center justify-between gap-2 px-2 py-3">
      <p className="text-muted-foreground text-xs tabular-nums">{rangeText}</p>
      {showPageNav ? (
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger dir="rtl" className="border-border h-8 w-20 px-2 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {[10, 20, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {formatCkbDigits(size)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground size-8"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              <ChevronLeftIcon className="size-4 rtl:rotate-180" />
            </Button>
            <span className="text-muted-foreground font-mono text-xs tabular-nums">
              {formatCkbDigits(pageIndex + 1)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground size-8"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              <ChevronRightIcon className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export type { ServiceAdminTableRow }

export function ServicesDataGrid({
  rows,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  isLoading,
  recordCount,
  rowSelection = {},
  onRowSelectionChange,
  selectable = true,
  onView,
  onEdit,
  onDeleteOne,
}: {
  rows: ServiceAdminTableRow[]
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  isLoading?: boolean
  recordCount: number
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  selectable?: boolean
  onView: (row: ServiceAdminTableRow) => void
  onEdit: (row: ServiceAdminTableRow) => void
  onDeleteOne: (row: ServiceAdminTableRow) => void
}) {
  const columns = useMemo<ColumnDef<ServiceAdminTableRow>[]>(() => {
    const base: ColumnDef<ServiceAdminTableRow>[] = [
      {
        id: "select",
        enableSorting: false,
        size: 40,
        meta: {
          headerTitle: "",
          skeleton: (
            <div className="flex justify-center">
              <Skeleton className="size-4 rounded-[4px]" />
            </div>
          ),
        },
        header: () => (
          <div className="flex justify-center px-2">
            <DataGridTableRowSelectAll />
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="flex justify-center px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <DataGridTableRowSelect row={row} />
          </div>
        ),
      },
      {
        id: "titleCkb",
        accessorKey: "titleCkb",
        sortingFn: "alphanumeric",
        meta: {
          headerTitle: NS.col.title,
          cellClassName: "min-w-0 flex-1",
          skeleton: (
            <div className="flex min-w-0 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-full max-w-[14rem]" />
              <Skeleton className="h-3 w-24" />
            </div>
          ),
        },
        header: ({ column }) => (
          <button
            type="button"
            className="-ms-3 inline-flex w-full justify-start px-3 py-2 text-start"
            onClick={() => column.toggleSorting()}
          >
            <TableSortLabel label={NS.col.title} sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => (
          <StackedBilingualCell
            primary={row.original.titleCkb}
            secondary={row.original.titleKmr}
          />
        ),
      },
      {
        id: "serviceType",
        accessorKey: "serviceType",
        sortingFn: "alphanumeric",
        size: 160,
        meta: {
          headerTitle: NS.col.type,
          cellClassName: "w-40",
          skeleton: <Skeleton className="h-3.5 w-24" />,
        },
        header: ({ column }) => (
          <button
            type="button"
            className="-ms-3 inline-flex w-full justify-start px-3 py-2 text-start"
            onClick={() => column.toggleSorting()}
          >
            <TableSortLabel label={NS.col.type} sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-foreground line-clamp-2 text-sm">
            {row.original.serviceType?.trim() || NS.dash}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => serviceDisplayStatus(row),
        sortingFn: "alphanumeric",
        size: 128,
        meta: {
          headerTitle: NS.col.status,
          cellClassName: "w-32",
          skeleton: <Skeleton className="h-5 w-16 rounded-md" />,
        },
        header: ({ column }) => (
          <button
            type="button"
            className="-ms-3 inline-flex w-full justify-start px-3 py-2 text-start"
            onClick={() => column.toggleSorting()}
          >
            <TableSortLabel label={NS.col.status} sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => <ServiceStatusPill service={row.original} />,
      },
      {
        id: "location",
        enableSorting: false,
        size: 144,
        meta: {
          headerTitle: NS.col.location,
          cellClassName: "hidden lg:table-cell w-36",
          skeleton: <Skeleton className="h-3 w-20" />,
        },
        header: NS.col.location,
        cell: ({ row }) => {
          const loc = row.original.location?.trim()
          return (
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <MapPinIcon className="size-3.5 shrink-0 opacity-70" />
              {loc || NS.dash}
            </span>
          )
        },
      },
      {
        accessorKey: "sortPublishedAt",
        id: "publishedAt",
        sortingFn: "basic",
        size: 128,
        meta: {
          headerTitle: NS.col.published,
          cellClassName: "w-32",
          skeleton: <Skeleton className="h-3.5 w-20" />,
        },
        header: ({ column }) => (
          <button
            type="button"
            className="-ms-3 inline-flex w-full justify-start px-3 py-2 text-start"
            onClick={() => column.toggleSorting()}
          >
            <TableSortLabel
              label={NS.col.published}
              sorted={column.getIsSorted()}
            />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums">
            {row.original.publishedAt
              ? formatNewsDateShort(row.original.publishedAt)
              : NS.dash}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        size: 112,
        meta: {
          headerTitle: NS.col.actions,
          cellClassName: "w-28",
          skeleton: (
            <div className="flex justify-center gap-1">
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          ),
        },
        header: () => <span className="sr-only">{NS.col.actions}</span>,
        cell: ({ row }) => (
          <div
            role="presentation"
            className="flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                "flex items-center gap-0.5 transition-opacity",
                "opacity-100 md:opacity-0 md:group-hover:opacity-100",
              )}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground size-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        onView(row.original)
                      }}
                    >
                      <EyeIcon className="size-4 rtl:rotate-180" />
                    </Button>
                  }
                />
                <TooltipContent>{NS.action.view}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground size-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(row.original)
                      }}
                    >
                      <PencilSquareIcon className="size-4" />
                    </Button>
                  }
                />
                <TooltipContent>{NS.action.edit}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteOne(row.original)
                      }}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  }
                />
                <TooltipContent>{NS.action.delete}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ),
      },
    ]

    if (!selectable) {
      return base.filter((c) => c.id !== "select")
    }
    return base
  }, [onDeleteOne, onEdit, onView, selectable])

  const pageCount = Math.max(
    1,
    Math.ceil(recordCount / Math.max(pagination.pageSize, 1)),
  )

  const table = useReactTable({
    data: rows,
    columns,
    manualPagination: true,
    pageCount:
      recordCount === 0
        ? pagination.pageIndex + 1
        : Math.max(pageCount, 1),
    state: {
      pagination,
      sorting,
      ...(selectable ? { rowSelection } : {}),
    },
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange: selectable ? onRowSelectionChange : undefined,
    enableRowSelection: selectable,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (original) =>
      original.id != null
        ? String(original.id)
        : String(original.sortPublishedAt),
  })

  return (
    <TooltipProvider delay={300}>
      <DataGridContainer border className="rounded-lg">
        <DataGrid
          table={table}
          recordCount={recordCount}
          skeletonRowCount={6}
          isLoading={isLoading}
          loadingMode="skeleton"
          emptyMessage=""
          tableLayout={{
            rowBorder: false,
            stripped: false,
            headerSticky: true,
            headerBackground: false,
            headerBorder: true,
            cellBorder: false,
          }}
          tableClassNames={{
            headerSticky:
              "sticky top-0 z-30 bg-muted/30 backdrop-blur-xs border-b border-border",
            bodyRow: "h-16 hover:bg-muted/40",
          }}
          onRowClick={(clicked) => {
            if (clicked.id != null) onView(clicked)
          }}
        >
          <DataGridScrollArea className="max-h-[70vh] min-h-[320px]">
            <DataGridTable />
          </DataGridScrollArea>
          <ServicesListPaginationFooter />
        </DataGrid>
      </DataGridContainer>
    </TooltipProvider>
  )
}
