"use client"

import { memo, type CSSProperties, type ReactNode, type Ref } from "react"
import {
  type Cell,
  type Header,
  type Row,
  type Table,
  flexRender,
} from "@tanstack/react-table"

import { useDataGrid } from "@/components/reui/data-grid/data-grid"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/** Row sections for optional pin support (unused in current dashboard). */
function getDataGridTableRowSections<TData>(
  table: Table<TData>,
  rowsPinnable?: boolean,
) {
  if (!rowsPinnable) {
    return {
      topRows: [] as Row<TData>[],
      centerRows: table.getRowModel().rows as Row<TData>[],
      bottomRows: [] as Row<TData>[],
    }
  }
  return {
    topRows: table.getTopRows() as Row<TData>[],
    centerRows: table.getCenterRows() as Row<TData>[],
    bottomRows: table.getBottomRows() as Row<TData>[],
  }
}

type PinnedBoundary = "top" | "bottom"

function getDataGridTableResolvedRows<TData>(
  table: Table<TData>,
  rowsPinnable?: boolean,
) {
  const { topRows, centerRows, bottomRows } = getDataGridTableRowSections(
    table,
    rowsPinnable,
  )
  const resolved: Array<{
    row: Row<TData>
    pinnedBoundary?: PinnedBoundary
  }> = []

  topRows.forEach((row, index) => {
    resolved.push({
      row,
      pinnedBoundary:
        index === topRows.length - 1 &&
        (centerRows.length > 0 || bottomRows.length > 0)
          ? "top"
          : undefined,
    })
  })
  centerRows.forEach((row) => resolved.push({ row }))
  bottomRows.forEach((row, index) => {
    resolved.push({
      row,
      pinnedBoundary:
        index === 0 && (centerRows.length > 0 || topRows.length > 0)
          ? "bottom"
          : undefined,
    })
  })

  return resolved
}

function DataGridTableBase({ children }: { children: ReactNode }) {
  return (
    <table
      data-slot="data-grid-table"
      dir="rtl"
      className="w-full caption-bottom text-sm"
    >
      {children}
    </table>
  )
}

function DataGridTableViewport({
  children,
  className,
  viewportRef,
  style,
}: {
  children: ReactNode
  className?: string
  viewportRef?: Ref<HTMLDivElement>
  style?: CSSProperties
}) {
  return (
    <div
      ref={viewportRef}
      data-slot="data-grid-table-viewport"
      className={className}
      style={style}
    >
      {children}
    </div>
  )
}

function DataGridTableHead({ children }: { children: ReactNode }) {
  return <thead data-slot="data-grid-table-head">{children}</thead>
}

function DataGridTableHeadRow({ children }: { children: ReactNode }) {
  return <tr className="border-border border-b">{children}</tr>
}

function DataGridTableHeadRowCell({
  header,
  children,
}: {
  header: Header<unknown, unknown>
  children: ReactNode
}) {
  const { props } = useDataGrid()
  const sticky = props.tableLayout?.headerSticky

  return (
    <th
      className={cn(
        "text-start align-middle font-medium",
        "text-xs uppercase tracking-wide text-muted-foreground",
        "bg-muted/30 px-3 py-2",
        sticky && "sticky top-0 z-10 bg-muted/30 backdrop-blur-xs",
        (header.column.columnDef.meta as { headerClassName?: string } | undefined)
          ?.headerClassName
      )}
      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
    >
      {children}
    </th>
  )
}

function DataGridTableRowSpacer() {
  return null
}

function DataGridTableBody({ children }: { children: ReactNode }) {
  return (
    <tbody className="divide-y divide-border/60">{children}</tbody>
  )
}

function DataGridTableFoot({ children }: { children: ReactNode }) {
  return (
    <tfoot className="border-border border-t bg-muted/20 font-medium">
      {children}
    </tfoot>
  )
}

function DataGridTableEmpty() {
  const { table, props } = useDataGrid()
  const colCount =
    table.getVisibleLeafColumns().length +
    (props.tableLayout?.columnsResizable ? 1 : 0)

  return (
    <tr>
      <td
        colSpan={Math.max(colCount, 1)}
        className="text-muted-foreground h-24 text-center align-middle text-sm"
      >
        {props.emptyMessage || "—"}
      </td>
    </tr>
  )
}

function DataGridTableRenderedRow<TData>({
  row,
  pinnedBoundary,
  rowRef,
}: {
  row: Row<TData>
  pinnedBoundary?: PinnedBoundary
  rowRef?: Ref<HTMLTableRowElement>
}) {
  const { props, table } = useDataGrid()
  const isRowPinned = row.getIsPinned?.() ?? false

  return (
      <tr
        ref={rowRef}
        data-state={
          table.options.enableRowSelection && row.getIsSelected()
            ? "selected"
            : undefined
        }
        data-row-pinned-boundary={pinnedBoundary}
        onClick={() =>
          props.onRowClick ? props.onRowClick(row.original as TData) : undefined
        }
        className={cn(
          "h-16 min-h-16 transition-colors hover:bg-muted/40",
          "data-[state=selected]:bg-muted/50",
          props.onRowClick && "cursor-pointer group",
          props.tableLayout?.rowsPinnable && isRowPinned && "bg-muted/25",
          props.tableClassNames?.bodyRow
        )}
      >
        {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
          <DataGridTableBodyRowCell key={cell.id} cell={cell}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </DataGridTableBodyRowCell>
        ))}
      </tr>
  )
}

function DataGridTableBodyRowCell<TData>({
  cell,
  children,
}: {
  cell: Cell<TData, unknown>
  children: ReactNode
}) {
  const { props } = useDataGrid()

  return (
    <td
      className={cn(
        "align-middle px-3 py-2",
        (cell.column.columnDef.meta as { cellClassName?: string } | undefined)
          ?.cellClassName
      )}
    >
      {children}
    </td>
  )
}

function DataGridTableRowSelect<TData>({ row }: { row: Row<TData> }) {
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
      className="translate-y-0.5"
    />
  )
}

function DataGridTableRowSelectAll() {
  const { table, isLoading } = useDataGrid()

  if (isLoading) {
    return (
      <Skeleton
        className="size-4 rounded-sm"
        aria-hidden
      />
    )
  }

  return (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={table.getIsSomePageRowsSelected()}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
      className="translate-y-0.5"
    />
  )
}

function DataGridTableBodyRows<TData>({ table }: { table: Table<TData> }) {
  const { isLoading, props } = useDataGrid()
  const pagination = table.getState().pagination
  const skeletonRows = Math.min(
    props.skeletonRowCount ?? Math.min(8, pagination?.pageSize ?? 8),
    pagination?.pageSize ?? 8,
  )

  if (isLoading && props.loadingMode === "skeleton" && pagination?.pageSize) {
    return (
      <>
        {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
          <tr
            key={`skeleton-${rowIndex}`}
            className="hover:bg-muted/20 h-16 min-h-16"
          >
            {table.getVisibleFlatColumns().map((column) => (
              <td key={column.id} className="px-3 py-2 align-middle">
                {column.columnDef.meta?.skeleton ?? (
                  <Skeleton className="h-6 w-full max-w-[12rem]" />
                )}
              </td>
            ))}
          </tr>
        ))}
      </>
    )
  }

  const resolved = getDataGridTableResolvedRows(
    table,
    props.tableLayout?.rowsPinnable,
  )

  if (!resolved.length) {
    return <DataGridTableEmpty />
  }

  return (
    <>
      {resolved.map(({ row, pinnedBoundary }) => (
        <DataGridTableRenderedRow
          key={row.id}
          row={row}
          pinnedBoundary={pinnedBoundary}
        />
      ))}
    </>
  )
}

const MemoizedDataGridTableBodyRows = memo(
  DataGridTableBodyRows,
  (_prev, next) => !!next.table.getState().columnSizingInfo?.isResizingColumn,
) as typeof DataGridTableBodyRows

function DataGridTable({
  footerContent,
  renderHeader = true,
}: {
  footerContent?: ReactNode
  renderHeader?: boolean
}) {
  const { table, props } = useDataGrid()

  return (
    <>
      <DataGridTableBase>
        {renderHeader ? (
          <DataGridTableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <DataGridTableHeadRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <DataGridTableHeadRowCell header={header} key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </DataGridTableHeadRowCell>
                ))}
              </DataGridTableHeadRow>
            ))}
          </DataGridTableHead>
        ) : null}
        <DataGridTableBody>
          <MemoizedDataGridTableBodyRows table={table} />
        </DataGridTableBody>
        {footerContent ? (
          <DataGridTableFoot>
            <tr>
              <td colSpan={table.getVisibleLeafColumns().length}>
                {footerContent}
              </td>
            </tr>
          </DataGridTableFoot>
        ) : null}
      </DataGridTableBase>
    </>
  )
}

export {
  DataGridTable,
  DataGridTableBase,
  DataGridTableBody,
  DataGridTableBodyRowCell,
  DataGridTableEmpty,
  DataGridTableFoot,
  DataGridTableHead,
  DataGridTableHeadRow,
  DataGridTableHeadRowCell,
  DataGridTableRenderedRow,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
  DataGridTableRowSpacer,
  DataGridTableViewport,
  getDataGridTableResolvedRows,
  getDataGridTableRowSections,
}
