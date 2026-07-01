"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline"

import { NS } from "@/components/featured/featured-strings"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCkbDigits } from "@/lib/intl-ckb"

export function FeaturedListPagination({
  pageIndex,
  pageSize,
  totalElements,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: {
  pageIndex: number
  pageSize: number
  totalElements: number
  onPageChange: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}) {
  const pageCount = Math.max(1, Math.ceil(totalElements / pageSize))
  const from = totalElements === 0 ? 0 : pageIndex * pageSize + 1
  const to = totalElements === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, totalElements)

  if (totalElements === 0) return null

  return (
    <div className="border-border/60 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
      <p className="text-muted-foreground text-sm tabular-nums">
        {NS.pagination.range(
          formatCkbDigits(from),
          formatCkbDigits(to),
          formatCkbDigits(totalElements),
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange ? (
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="border-border h-9 w-20 px-2 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {formatCkbDigits(size)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        {pageCount > 1 ? (
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground size-8"
              disabled={pageIndex <= 0}
              onClick={() => onPageChange(pageIndex - 1)}
            >
              <ChevronLeftIcon className="size-4 rtl:rotate-180" />
            </Button>
            <span className="text-muted-foreground px-2 font-mono text-sm tabular-nums">
              {formatCkbDigits(pageIndex + 1)} / {formatCkbDigits(pageCount)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground size-8"
              disabled={pageIndex >= pageCount - 1}
              onClick={() => onPageChange(pageIndex + 1)}
            >
              <ChevronRightIcon className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
