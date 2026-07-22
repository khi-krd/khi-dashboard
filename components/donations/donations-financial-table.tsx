"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from "@heroicons/react/24/outline"

import { DonationStatusPill } from "@/components/donations/donation-status-pill"
import { NS } from "@/components/donations/donations-strings"
import { Button } from "@/components/ui/button"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { formatRelativeTimeKu } from "@/lib/news-relative-time"
import { cn } from "@/lib/utils"
import type { FinancialDonationRow } from "@/types/donations-ui"

function formatAmount(amount: number | null | undefined, currency?: string | null) {
  if (amount == null || !Number.isFinite(amount)) return "—"
  const cur = currency?.trim() || "IQD"
  return `${formatCkbDigits(amount)} ${cur}`
}

export function DonationsFinancialTable({
  rows,
  pageIndex,
  pageSize,
  totalElements,
  onPageChange,
  onView,
}: {
  rows: FinancialDonationRow[]
  pageIndex: number
  pageSize: number
  totalElements: number
  onPageChange: (page: number) => void
  onView: (row: FinancialDonationRow) => void
}) {
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize))
  const from = totalElements === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalElements)
  const isFirstPage = pageIndex <= 0
  const isLastPage = pageIndex >= totalPages - 1

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground rounded-xl border border-dashed px-6 py-12 text-center text-sm">
        {NS.financial.empty}
      </p>
    )
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border text-muted-foreground/80 border-b text-xs font-medium">
              <th className="w-14 py-2.5 text-start">{NS.table.id}</th>
              <th className="py-2.5 text-start">{NS.table.donor}</th>
              <th className="w-36 py-2.5 text-start">{NS.table.amount}</th>
              <th className="w-32 py-2.5 text-start">{NS.financial.paymentMethod}</th>
              <th className="w-24 py-2.5 text-start">{NS.table.status}</th>
              <th className="w-28 py-2.5 text-start">{NS.table.date}</th>
              <th className="w-16 py-2.5 text-start" />
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="group hover:bg-muted/40 cursor-pointer transition-colors"
                onClick={() => onView(row)}
              >
                <td className="text-muted-foreground py-3 font-mono text-xs">
                  #{formatCkbDigits(row.id)}
                </td>
                <td className="min-w-0 py-3">
                  <div className="truncate font-medium">
                    {row.donorName?.trim() || "—"}
                  </div>
                  {row.email?.trim() ? (
                    <div className="text-muted-foreground mt-0.5 truncate text-xs">
                      {row.email}
                    </div>
                  ) : null}
                </td>
                <td className="py-3 font-mono text-xs">
                  {formatAmount(row.amount, row.currency)}
                </td>
                <td className="text-muted-foreground py-3 text-xs">
                  {row.paymentMethod
                    ? NS.paymentMethod[
                        row.paymentMethod as keyof typeof NS.paymentMethod
                      ] ?? row.paymentMethod
                    : "—"}
                </td>
                <td className="py-3">
                  <DonationStatusPill status={row.status} />
                </td>
                <td className="text-muted-foreground py-3 font-mono text-xs">
                  {row.createdAt ? formatRelativeTimeKu(row.createdAt) : "—"}
                </td>
                <td className="py-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-7",
                      "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      onView(row)
                    }}
                    aria-label={NS.action.view}
                  >
                    <EyeIcon className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-border flex items-center justify-between border-t px-4 py-3">
        <p className="text-muted-foreground text-xs">
          {NS.table.page(
            formatCkbDigits(from),
            formatCkbDigits(to),
            formatCkbDigits(totalElements),
          )}
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={isFirstPage}
            onClick={() => onPageChange(pageIndex - 1)}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={isLastPage}
            onClick={() => onPageChange(pageIndex + 1)}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
