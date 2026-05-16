"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
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
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { NS } from "@/components/news/news-strings"

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

import type { CategoryDto, Language, NewsDto } from "@/types/news"
import { formatCkbDigits, formatNewsDateShort } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"

function TableSortLabel({
  label,
  sorted,
}: {
  label: string
  sorted?: false | "asc" | "desc"
}) {
  const mark = sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : ""
  return (
    <span className="inline-flex cursor-pointer items-center gap-2">
      {label}{" "}
      <span
        className="font-mono text-muted-foreground text-[0.7rem]"
        aria-hidden
      >
        {mark}
      </span>
    </span>
  )
}

function NewsListLangChips({ langs }: { langs: Language[] }) {
  const set = new Set(langs ?? [])
  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {set.has("CKB") ? (
        <span
          className={cn(
            "text-primary border-primary/20 bg-primary/10 inline-flex rounded border",
            "px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
          )}
        >
          CKB
        </span>
      ) : null}
      {set.has("KMR") ? (
        <span
          className={cn(
            "text-foreground border-border bg-muted inline-flex rounded border",
            "px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
          )}
        >
          KMR
        </span>
      ) : null}
    </div>
  )
}

function NewsListPaginationFooter() {
  const { table, recordCount, isLoading } = useDataGrid()

  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()
  const from =
    recordCount === 0 || !Number.isFinite(recordCount)
      ? 0
      : pageIndex * pageSize + 1
  const to =
    recordCount === 0
      ? 0
      : Math.min((pageIndex + 1) * pageSize, recordCount)

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
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-xs whitespace-nowrap">
              {NS.list.paginationPageSize}
            </span>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger
                dir="rtl"
                className="border-border h-8 w-20 px-2 text-xs"
              >
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
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground size-8"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              aria-label={NS.list.paginationPrev}
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
              aria-label={NS.list.paginationNext}
            >
              <ChevronRightIcon className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export type NewsAdminTableRow = NewsDto & {
  titleCkb: string
  titleKmr?: string | null
  sortPublishedAt: number
}

export function NewsDataGrid({
  rows,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  rowSelection = {},
  onRowSelectionChange,
  selectable = false,
  isLoading,
  recordCount,
  onView,
  onEdit,
  onDeleteOne,
}: {
  rows: NewsAdminTableRow[]
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  /** When true, renders the trailing selection column (post-v1 bulk actions). */
  selectable?: boolean
  isLoading?: boolean
  recordCount: number
  onView: (row: NewsAdminTableRow) => void
  onEdit: (row: NewsAdminTableRow) => void
  onDeleteOne: (row: NewsAdminTableRow) => void
}) {
  const columns = useMemo<ColumnDef<NewsAdminTableRow>[]>(() => {
    const base: ColumnDef<NewsAdminTableRow>[] = [
      {
        id: "cover",
        enableSorting: false,
        size: 56,
        minSize: 56,
        maxSize: 56,
        meta: {
          headerTitle: NS.column.cover,
          cellClassName: "w-14 min-w-14 max-w-14",
          skeleton: (
            <Skeleton className="size-10 shrink-0 rounded-md" aria-hidden />
          ),
        },
        header: NS.column.cover,
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
            <div
              className="bg-muted text-muted-foreground/50 flex size-10 items-center justify-center rounded-md"
              aria-hidden
            >
              <PhotoIcon className="size-4" />
            </div>
          ),
      },
      {
        id: "titleCkb",
        accessorKey: "titleCkb",
        sortingFn: "alphanumeric",
        size: 280,
        minSize: 120,
        meta: {
          headerTitle: NS.column.title,
          cellClassName: "min-w-0 max-w-0",
          skeleton: (
            <div className="flex min-w-0 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-full max-w-[14rem]" aria-hidden />
              <Skeleton className="h-3 w-24 max-w-[10rem]" aria-hidden />
            </div>
          ),
        },
        header: ({ column }) => (
          <button
            type="button"
            className="-ms-3 inline-flex w-full justify-start px-3 py-2 text-start"
            onClick={() => column.toggleSorting()}
          >
            <TableSortLabel
              label={NS.column.title}
              sorted={column.getIsSorted()}
            />
          </button>
        ),
        cell: ({ row }) => {
          const ckb = row.original.titleCkb?.trim() || NS.dash
          const kmrRaw = (row.original.titleKmr ?? "").trim()
          return (
            <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
              <span className="text-foreground line-clamp-1 font-medium">
                {ckb}
              </span>
              <span className="text-muted-foreground line-clamp-1 text-xs">
                {kmrRaw || NS.dash}
              </span>
            </div>
          )
        },
      },
      {
        id: "categoryCell",
        enableSorting: false,
        size: 176,
        minSize: 176,
        accessorFn: (r) => r.category?.ckbName ?? "",
        meta: {
          headerTitle: NS.column.category,
          cellClassName: "w-44 min-w-44 max-w-44",
          skeleton: (
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ),
        },
        header: NS.column.category,
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5 leading-tight">
            <span className="text-foreground text-sm">
              {(row.original.category as CategoryDto | undefined)?.ckbName ??
                NS.dash}
            </span>
            <span className="text-muted-foreground text-xs">
              {(row.original.subCategory as CategoryDto | undefined)?.ckbName ??
                NS.dash}
            </span>
          </div>
        ),
      },
      {
        id: "langs",
        enableSorting: false,
        size: 128,
        minSize: 128,
        meta: {
          headerTitle: NS.column.languages,
          cellClassName: "w-32 min-w-32 max-w-32",
          skeleton: (
            <div className="flex justify-center gap-1">
              <Skeleton className="h-4 w-9 rounded" />
              <Skeleton className="h-4 w-9 rounded" />
            </div>
          ),
        },
        header: NS.column.languages,
        cell: ({ row }) => (
          <NewsListLangChips langs={row.original.contentLanguages ?? []} />
        ),
      },
      {
        accessorKey: "sortPublishedAt",
        id: "publishedOn",
        sortingFn: "basic",
        size: 128,
        minSize: 128,
        meta: {
          headerTitle: NS.column.date,
          cellClassName: "w-32 min-w-32 max-w-32 text-start",
          skeleton: <Skeleton className="h-3.5 w-20" aria-hidden />,
        },
        header: ({ column }) => (
          <button
            type="button"
            className="-ms-3 inline-flex w-full justify-start px-3 py-2 text-start"
            onClick={() => column.toggleSorting()}
          >
            <TableSortLabel
              label={NS.column.date}
              sorted={column.getIsSorted()}
            />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums">
            {formatNewsDateShort(row.original.datePublished)}
          </span>
        ),
      },
      {
        id: "mediaCount",
        enableSorting: false,
        size: 80,
        minSize: 80,
        meta: {
          headerTitle: NS.column.media,
          cellClassName: "w-20 min-w-20 max-w-20 text-center",
          skeleton: <Skeleton className="mx-auto h-3.5 w-12" aria-hidden />,
        },
        header: NS.column.media,
        cell: ({ row }) => {
          const n = row.original.media?.length ?? 0
          return (
            <span className="text-muted-foreground inline-flex items-center justify-center gap-1 text-sm">
              <PhotoIcon className="size-4 opacity-80" aria-hidden />
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
        minSize: 112,
        maxSize: 112,
        meta: {
          headerTitle: NS.column.actions,
          cellClassName: "w-28 min-w-28 max-w-28",
          skeleton: (
            <div className="flex justify-center gap-1">
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          ),
        },
        header: () => (
          <span className="sr-only">{NS.column.actions}</span>
        ),
        cell: ({ row }) => (
          <div
            role="presentation"
            className="flex justify-center"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
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
                      className="text-muted-foreground group-hover:text-foreground size-8 shrink-0"
                      aria-label={NS.action.view}
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
                      className="text-muted-foreground group-hover:text-foreground size-8 shrink-0"
                      aria-label={NS.action.edit}
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
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8 shrink-0"
                      aria-label={NS.action.delete}
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

    if (!selectable) return base

    return [
      ...base,
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
          <div className="flex justify-center px-2">
            <DataGridTableRowSelect row={row} />
          </div>
        ),
      },
    ]
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
      original.id != null ? String(original.id) : String(original.sortPublishedAt),
    defaultColumn: {
      enableSorting: false,
    },
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
          onRowClick={(clicked: NewsAdminTableRow) => {
            if (clicked.id != null) onView(clicked)
          }}
        >
          <DataGridScrollArea className="max-h-[70vh] min-h-[320px]">
            <DataGridTable />
          </DataGridScrollArea>
          <NewsListPaginationFooter />
        </DataGrid>
      </DataGridContainer>
    </TooltipProvider>
  )
}
