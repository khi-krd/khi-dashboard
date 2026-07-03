"use client"

import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"

import {
  DataGrid,
  DataGridContainer,
} from "@/components/reui/data-grid/data-grid"
import { DataGridScrollArea } from "@/components/reui/data-grid/data-grid-scroll-area"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCkbDigits } from "@/lib/intl-ckb"

export type TopicRow = {
  id: number
  nameCkb?: string | null
  nameKmr?: string | null
}

export type TopicsDataGridLabels = {
  dash: string
  nameCkb: string
  nameKmr: string
  actions: string
  delete: string
  usage: (count: string) => string
  emptyTitle: string
  emptySubtitle: string
}

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

export function TopicsDataGrid({
  rows,
  usageByTopic,
  isLoading,
  filterListHref,
  onDelete,
  labels,
}: {
  rows: TopicRow[]
  usageByTopic: Map<number, number>
  isLoading: boolean
  filterListHref: (topicId: number) => string
  onDelete: (topic: TopicRow) => void
  labels: TopicsDataGridLabels
}) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<TopicRow>[]>(
    () => [
      {
        id: "nameCkb",
        accessorFn: (row) => row.nameCkb ?? "",
        meta: {
          headerTitle: labels.nameCkb,
          skeleton: <Skeleton className="h-10 w-full max-w-xs" />,
        },
        header: ({ column }) => (
          <button
            type="button"
            className="text-start"
            onClick={() => column.toggleSorting()}
          >
            <TableSortLabel
              label={labels.nameCkb}
              sorted={column.getIsSorted()}
            />
          </button>
        ),
        cell: ({ row }) => {
          const count = usageByTopic.get(row.original.id) ?? 0
          return (
            <div className="flex min-w-0 flex-col gap-0.5 py-0.5">
              <Link
                href={filterListHref(row.original.id)}
                className="text-primary line-clamp-1 font-medium hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {row.original.nameCkb?.trim() || labels.dash}
              </Link>
              <span className="text-muted-foreground text-xs">
                {labels.usage(formatCkbDigits(count))}
              </span>
            </div>
          )
        },
      },
      {
        id: "nameKmr",
        accessorFn: (row) => row.nameKmr ?? "",
        meta: {
          headerTitle: labels.nameKmr,
          skeleton: <Skeleton className="h-8 w-32" />,
        },
        header: ({ column }) => (
          <button
            type="button"
            className="text-start"
            onClick={() => column.toggleSorting()}
          >
            <TableSortLabel
              label={labels.nameKmr}
              sorted={column.getIsSorted()}
            />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground line-clamp-1" dir="ltr">
            {row.original.nameKmr?.trim() || labels.dash}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        size: 112,
        meta: {
          headerTitle: labels.actions,
          cellClassName: "w-28",
          skeleton: <Skeleton className="h-8 w-24" />,
        },
        header: labels.actions,
        cell: ({ row }) => (
          <div
            className="flex items-center justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 gap-1"
              onClick={() => onDelete(row.original)}
            >
              <TrashIcon className="size-4" />
              {labels.delete}
            </Button>
          </div>
        ),
      },
    ],
    [filterListHref, labels, onDelete, usageByTopic],
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <DataGrid
      table={table}
      recordCount={rows.length}
      isLoading={isLoading}
      emptyMessage={
        <div className="flex flex-col items-center gap-1 py-8 text-center">
          <p className="text-foreground text-sm font-medium">{labels.emptyTitle}</p>
          <p className="text-muted-foreground max-w-md text-sm">{labels.emptySubtitle}</p>
        </div>
      }
      tableLayout={{ rowBorder: true, headerBorder: true }}
      tableClassNames={{
        header: "bg-muted/30",
        bodyRow: "group/row hover:bg-muted/40 transition-colors",
      }}
    >
      <DataGridContainer border={false} className="overflow-hidden rounded-lg border">
        <DataGridScrollArea>
          <DataGridTable />
        </DataGridScrollArea>
      </DataGridContainer>
    </DataGrid>
  )
}
