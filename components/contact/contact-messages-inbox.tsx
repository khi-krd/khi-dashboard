"use client"

import { useState } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from "@heroicons/react/24/outline"

import { ContactErrorState } from "@/components/contact/contact-error-state"
import { ContactMessageSheet } from "@/components/contact/contact-message-sheet"
import { NS } from "@/components/contact/contact-strings"
import { DonationStatusPill } from "@/components/donations/donation-status-pill"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useContactMessagesQuery } from "@/hooks/useContact"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { formatRelativeTimeKu } from "@/lib/news-relative-time"
import { cn } from "@/lib/utils"
import type { ContactMessageDto } from "@/types/contact"

const PAGE_SIZE = 20

function InboxSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 rounded-lg" />
      <Skeleton className="h-10 rounded-lg" />
      <Skeleton className="h-10 rounded-lg" />
      <Skeleton className="h-10 rounded-lg" />
    </div>
  )
}

export function ContactMessagesInbox() {
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<ContactMessageDto | null>(null)
  const messagesQuery = useContactMessagesQuery({ page, size: PAGE_SIZE })

  const data = messagesQuery.data
  const rows = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE))
  const from = totalElements === 0 ? 0 : page * PAGE_SIZE + 1
  const to = Math.min((page + 1) * PAGE_SIZE, totalElements)

  if (messagesQuery.isError) {
    return <ContactErrorState onRetry={() => void messagesQuery.refetch()} />
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{NS.messages.title}</h2>
        <p className="text-muted-foreground text-xs">
          {NS.messages.count(formatCkbDigits(totalElements))}
        </p>
      </div>

      {messagesQuery.isLoading ? (
        <InboxSkeleton />
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground rounded-xl border border-dashed px-6 py-12 text-center text-sm">
          {NS.messages.empty}
        </p>
      ) : (
        <div className="border-border bg-card overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border text-muted-foreground/80 border-b text-xs font-medium">
                  <th className="w-14 py-2.5 text-start">{NS.table.id}</th>
                  <th className="w-44 py-2.5 text-start">{NS.messages.sender}</th>
                  <th className="py-2.5 text-start">{NS.messages.subject}</th>
                  <th className="w-32 py-2.5 text-start">{NS.messages.contact}</th>
                  <th className="w-20 py-2.5 text-start">{NS.messages.locale}</th>
                  <th className="w-28 py-2.5 text-start">{NS.messages.status}</th>
                  <th className="w-28 py-2.5 text-start">{NS.messages.date}</th>
                  <th className="w-16 py-2.5 text-start" />
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-muted/40 cursor-pointer transition-colors"
                    onClick={() => setSelected(row)}
                  >
                    <td className="text-muted-foreground py-3 font-mono text-xs">
                      #{formatCkbDigits(row.id ?? 0)}
                    </td>
                    <td className="min-w-0 py-3">
                      <div className="truncate font-medium">
                        {row.name?.trim() || "—"}
                      </div>
                      {row.email?.trim() ? (
                        <div
                          className="text-muted-foreground mt-0.5 truncate font-mono text-xs"
                          dir="ltr"
                        >
                          {row.email}
                        </div>
                      ) : null}
                    </td>
                    <td className="min-w-0 py-3">
                      <div className="truncate text-xs font-medium">
                        {row.subject?.trim() || "—"}
                      </div>
                      {row.message?.trim() ? (
                        <div className="text-muted-foreground mt-0.5 max-w-md truncate text-xs">
                          {row.message}
                        </div>
                      ) : null}
                    </td>
                    <td
                      className="text-muted-foreground py-3 font-mono text-xs"
                      dir="ltr"
                    >
                      {row.phone?.trim() || "—"}
                    </td>
                    <td className="py-3">
                      {row.locale?.trim() ? (
                        <span className="bg-muted text-muted-foreground inline-flex rounded px-1.5 py-0.5 font-mono text-[10px] uppercase">
                          {row.locale}
                        </span>
                      ) : (
                        "—"
                      )}
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
                          setSelected(row)
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
              {formatCkbDigits(from)}–{formatCkbDigits(to)} لە{" "}
              {formatCkbDigits(totalElements)}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                disabled={page <= 0 || messagesQuery.isFetching}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronRightIcon className="size-4" />
              </Button>
              <span className="text-muted-foreground px-2 font-mono text-xs">
                {formatCkbDigits(page + 1)} / {formatCkbDigits(totalPages)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                disabled={page >= totalPages - 1 || messagesQuery.isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <ContactMessageSheet
        open={selected != null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        row={selected}
      />
    </div>
  )
}
