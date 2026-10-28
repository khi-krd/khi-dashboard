"use client"

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  EyeIcon,
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
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { VideoCoverThumb } from "@/components/videos/video-cover-thumb"
import { VideoListLangChips } from "@/components/videos/video-language-chip"
import { VideoSourcePill } from "@/components/videos/video-source-pill"
import { VideoTypePill } from "@/components/videos/video-type-pill"
import { NS } from "@/components/videos/videos-strings"
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
import { formatDuration } from "@/lib/video-format"
import { formatCkbDigits, formatNewsDateShort } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { VideoAdminTableRow } from "@/types/videos-ui"

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
      <span className={primaryClassName}>
        {top || <span className="text-muted-foreground/60 text-xs">{NS.dash}</span>}
      </span>
      {bottom ? (
        <span className="text-muted-foreground line-clamp-1 text-xs">{bottom}</span>
      ) : (
        <span className="text-muted-foreground/60 text-xs">{NS.dash}</span>
      )}
    </div>
  )
}

function VideosListPaginationFooter() {
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
      {pageCount > 1 ? (
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

export function VideosDataGrid({
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
  rows: VideoAdminTableRow[]
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  isLoading?: boolean
  recordCount: number
  onView: (row: VideoAdminTableRow) => void
  onEdit: (row: VideoAdminTableRow) => void
  onDeleteOne: (row: VideoAdminTableRow) => void
}) {
  const columns = useMemo<ColumnDef<VideoAdminTableRow>[]>(
    () => [
      {
        id: "cover",
        enableSorting: false,
        size: 64,
        meta: {
          headerTitle: NS.col.cover,
          cellClassName: "w-16 min-w-16",
          skeleton: <Skeleton className="h-10 w-14 shrink-0 rounded-md" />,
        },
        header: NS.col.cover,
        cell: ({ row }) => <VideoCoverThumb video={row.original} />,
      },
      {
        id: "titleCkb",
        accessorKey: "titleCkb",
        sortingFn: "alphanumeric",
        meta: {
          headerTitle: NS.col.title,
          cellClassName: "min-w-0 max-w-0 flex-1",
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
        size: 112,
        meta: {
          headerTitle: NS.col.type,
          cellClassName: "w-28",
          skeleton: <Skeleton className="h-5 w-20 rounded-md" />,
        },
        header: NS.col.type,
        cell: ({ row }) => (
          <VideoTypePill
            videoType={row.original.videoType}
            albumOfMemories={row.original.albumOfMemories}
            className="w-auto"
          />
        ),
      },
      {
        id: "topic",
        enableSorting: false,
        size: 144,
        meta: {
          headerTitle: NS.col.topic,
          cellClassName: "w-36 hidden xl:table-cell",
          skeleton: <Skeleton className="h-3 w-24" />,
        },
        header: NS.col.topic,
        cell: ({ row }) => (
          <StackedBilingualCell
            primary={row.original.topicNameCkb}
            secondary={row.original.topicNameKmr}
          />
        ),
      },
      {
        id: "duration",
        accessorKey: "sortDuration",
        sortingFn: "basic",
        size: 80,
        meta: {
          headerTitle: NS.col.duration,
          cellClassName: "w-20",
          skeleton: <Skeleton className="h-3.5 w-14" />,
        },
        header: ({ column }) => (
          <button
            type="button"
            className="-ms-3 inline-flex w-full justify-start px-3 py-2 text-start"
            onClick={() => column.toggleSorting()}
          >
            <TableSortLabel
              label={NS.col.duration}
              sorted={column.getIsSorted()}
            />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono text-xs tabular-nums">
            {row.original.durationSeconds != null
              ? formatDuration(row.original.durationSeconds)
              : NS.dash}
          </span>
        ),
      },
      {
        id: "quality",
        enableSorting: false,
        size: 96,
        meta: {
          headerTitle: NS.col.quality,
          cellClassName: "w-24 hidden lg:table-cell",
          skeleton: <Skeleton className="h-3 w-16" />,
        },
        header: NS.col.quality,
        cell: ({ row }) => (
          <StackedBilingualCell
            primary={row.original.resolution}
            secondary={row.original.fileFormat?.toUpperCase()}
            primaryClassName="text-foreground text-sm"
          />
        ),
      },
      {
        id: "source",
        enableSorting: false,
        size: 96,
        meta: {
          headerTitle: NS.col.source,
          cellClassName: "w-24",
          skeleton: <Skeleton className="h-5 w-16 rounded-md" />,
        },
        header: NS.col.source,
        cell: ({ row }) => <VideoSourcePill video={row.original} />,
      },
      {
        id: "langs",
        enableSorting: false,
        size: 96,
        meta: {
          headerTitle: NS.col.languages,
          cellClassName: "w-24",
          skeleton: <Skeleton className="h-4 w-16" />,
        },
        header: NS.col.languages,
        cell: ({ row }) => (
          <VideoListLangChips langs={row.original.contentLanguages ?? []} />
        ),
      },
      {
        accessorKey: "sortPublishDate",
        id: "publishDate",
        sortingFn: "basic",
        size: 112,
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
            {row.original.publishmentDate
              ? formatNewsDateShort(row.original.publishmentDate)
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
          skeleton: <Skeleton className="h-8 w-24" />,
        },
        header: NS.col.actions,
        cell: ({ row }) => (
          <div
            className="flex items-center justify-end gap-0.5 opacity-100 md:opacity-0 md:group-hover/row:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <TooltipProvider delay={200}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground size-8"
                      onClick={() => onView(row.original)}
                    >
                      <EyeIcon className="size-4" />
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
                      size="icon-sm"
                      className="text-muted-foreground size-8"
                      onClick={() => onEdit(row.original)}
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
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8"
                      onClick={() => onDeleteOne(row.original)}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  }
                />
                <TooltipContent>{NS.action.delete}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    [onDeleteOne, onEdit, onView],
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { pagination, sorting },
    onPaginationChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(recordCount / pagination.pageSize)),
  })

  return (
    <DataGrid
      table={table}
      recordCount={recordCount}
      isLoading={isLoading}
      onRowClick={onView}
      tableLayout={{ rowBorder: true, headerBorder: true }}
      tableClassNames={{
        header: "bg-muted/30",
        bodyRow:
          "group/row h-16 cursor-pointer hover:bg-muted/40 transition-colors",
      }}
    >
      <DataGridContainer border={false} className="overflow-hidden rounded-lg border">
        <DataGridScrollArea>
          <DataGridTable />
        </DataGridScrollArea>
        <VideosListPaginationFooter />
      </DataGridContainer>
    </DataGrid>
  )
}
