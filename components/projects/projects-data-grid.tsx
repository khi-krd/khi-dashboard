"use client"

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  EyeIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import { useMemo } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { ProjectListLangChips } from "@/components/projects/project-language-chip"
import { ProjectStatusPill } from "@/components/projects/project-status-pill"
import { NS } from "@/components/projects/projects-strings"
import {
  DataGrid,
  DataGridContainer,
  useDataGrid,
} from "@/components/reui/data-grid/data-grid"
import { DataGridScrollArea } from "@/components/reui/data-grid/data-grid-scroll-area"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
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
import type { ProjectAdminTableRow } from "@/types/projects-ui"

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
        <ChevronUpIcon className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
      ) : sorted === "desc" ? (
        <ChevronDownIcon className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
      ) : null}
    </span>
  )
}

function StackedBilingualCell({
  primary,
  secondary,
  primaryClassName = "text-foreground line-clamp-1 font-medium",
}: {
  primary?: string | null
  secondary?: string | null
  primaryClassName?: string
}) {
  const top = primary?.trim()
  const bottom = secondary?.trim()
  return (
    <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
      <span className={primaryClassName}>{top || NS.dash}</span>
      {bottom ? (
        <span className="text-muted-foreground line-clamp-1 text-xs">{bottom}</span>
      ) : (
        <span className="text-muted-foreground/60 text-xs">{NS.dash}</span>
      )}
    </div>
  )
}

function ProjectsListPaginationFooter() {
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
  const showPageNav = pageCount > 1

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

export function ProjectsDataGrid({
  rows,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  isLoading,
  recordCount,
  onView,
  onEdit,
  onDeleteOne,
}: {
  rows: ProjectAdminTableRow[]
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  isLoading?: boolean
  recordCount: number
  onView: (row: ProjectAdminTableRow) => void
  onEdit: (row: ProjectAdminTableRow) => void
  onDeleteOne: (row: ProjectAdminTableRow) => void
}) {
  const columns = useMemo<ColumnDef<ProjectAdminTableRow>[]>(
    () => [
      {
        id: "cover",
        enableSorting: false,
        size: 56,
        meta: {
          headerTitle: NS.col.cover,
          cellClassName: "w-14 min-w-14 max-w-14",
          skeleton: <Skeleton className="size-10 shrink-0 rounded-md" />,
        },
        header: NS.col.cover,
        cell: ({ row }) =>
          row.original.coverUrl ? (
            <Image
              src={row.original.coverUrl}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-md object-cover"
              unoptimized={row.original.coverUrl.startsWith("http")}
            />
          ) : (
            <div className="bg-muted text-muted-foreground/50 flex size-10 items-center justify-center rounded-md">
              <PhotoIcon className="size-4" />
            </div>
          ),
      },
      {
        id: "titleCkb",
        accessorKey: "titleCkb",
        sortingFn: "alphanumeric",
        meta: {
          headerTitle: NS.col.title,
          cellClassName: "min-w-0 max-w-0",
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
        id: "type",
        enableSorting: false,
        size: 176,
        meta: {
          headerTitle: NS.col.type,
          cellClassName: "w-40 min-w-40",
          skeleton: (
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ),
        },
        header: NS.col.type,
        cell: ({ row }) => (
          <StackedBilingualCell
            primary={row.original.projectTypeCkb}
            secondary={row.original.projectTypeKmr}
            primaryClassName="text-foreground line-clamp-1 text-sm"
          />
        ),
      },
      {
        id: "status",
        enableSorting: false,
        size: 112,
        meta: {
          headerTitle: NS.col.status,
          cellClassName: "w-28",
          skeleton: <Skeleton className="h-5 w-16 rounded-md" />,
        },
        header: NS.col.status,
        cell: ({ row }) => <ProjectStatusPill status={row.original.status} />,
      },
      {
        id: "location",
        enableSorting: false,
        size: 128,
        meta: {
          headerTitle: NS.col.location,
          cellClassName: "hidden lg:table-cell w-32",
          skeleton: <Skeleton className="h-3 w-20" />,
        },
        header: NS.col.location,
        cell: ({ row }) => {
          const loc = row.original.ckbContent?.location?.trim()
          return (
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <MapPinIcon className="size-3.5 shrink-0 opacity-70" />
              {loc || NS.dash}
            </span>
          )
        },
      },
      {
        id: "langs",
        enableSorting: false,
        size: 96,
        meta: {
          headerTitle: NS.col.languages,
          cellClassName: "w-24",
          skeleton: (
            <div className="flex justify-center gap-1">
              <Skeleton className="h-4 w-9 rounded" />
              <Skeleton className="h-4 w-9 rounded" />
            </div>
          ),
        },
        header: NS.col.languages,
        cell: ({ row }) => (
          <ProjectListLangChips langs={row.original.contentLanguages ?? []} />
        ),
      },
      {
        accessorKey: "sortProjectDate",
        id: "projectDate",
        sortingFn: "basic",
        meta: {
          headerTitle: NS.col.date,
          cellClassName: "w-28",
          skeleton: <Skeleton className="h-3.5 w-20" />,
        },
        header: ({ column }) => (
          <button
            type="button"
            className="-ms-3 inline-flex w-full justify-start px-3 py-2 text-start"
            onClick={() => column.toggleSorting()}
          >
            <TableSortLabel label={NS.col.date} sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums">
            {row.original.projectDate
              ? formatNewsDateShort(row.original.projectDate)
              : NS.dash}
          </span>
        ),
      },
      {
        id: "mediaCount",
        enableSorting: false,
        size: 64,
        meta: {
          headerTitle: NS.col.media,
          cellClassName: "w-16 text-center",
          skeleton: <Skeleton className="mx-auto h-3.5 w-12" />,
        },
        header: NS.col.media,
        cell: ({ row }) => {
          const n = row.original.media?.length ?? 0
          return (
            <span className="text-muted-foreground inline-flex items-center justify-center gap-1 text-sm">
              <PhotoIcon className="size-4 opacity-80" />
              <span className="font-mono text-xs tabular-nums">
                {n > 0 ? formatCkbDigits(n) : NS.dash}
              </span>
            </span>
          )
        },
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
    ],
    [onDeleteOne, onEdit, onView],
  )

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
    state: { pagination, sorting },
    onPaginationChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (original) =>
      original.id != null ? String(original.id) : String(original.sortProjectDate),
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
          }}
          onRowClick={(clicked) => {
            if (clicked.id != null) onView(clicked)
          }}
        >
          <DataGridScrollArea className="max-h-[70vh] min-h-[320px]">
            <DataGridTable />
          </DataGridScrollArea>
          <ProjectsListPaginationFooter />
        </DataGrid>
      </DataGridContainer>
    </TooltipProvider>
  )
}
