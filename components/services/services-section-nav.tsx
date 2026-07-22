"use client"

import { PlusIcon } from "@heroicons/react/24/outline"

import { ServiceStatusPill } from "@/components/services/service-status-pill"
import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { ServiceAdminTableRow } from "@/types/services-ui"

export function ServicesSectionNav({
  rows,
  selectedId,
  isLoading,
  onAddSection,
  onSelectSection,
}: {
  rows: ServiceAdminTableRow[]
  selectedId: number | "new" | null
  isLoading?: boolean
  onAddSection: () => void
  onSelectSection: (id: number) => void
}) {
  const sorted = [...rows].sort(
    (a, b) => a.sortOrderValue - b.sortOrderValue,
  )

  return (
    <nav className="flex h-full flex-col" aria-label={NS.list.sectionsHeading}>
      <div className="border-border border-b px-4 py-4">
        <p className="text-muted-foreground text-xs leading-relaxed">
          {NS.page.siteNavHint}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-muted-foreground px-2 py-6 text-center text-sm">
            {NS.empty.no_services.subtitle}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {sorted.map((row, index) => {
              if (row.id == null) return null
              const isActive = selectedId === row.id
              const title =
                row.titleCkb?.trim() ||
                row.titleKmr?.trim() ||
                NS.section.unnamed
              const sortLabel =
                typeof row.sortOrder === "number"
                  ? formatCkbDigits(row.sortOrder)
                  : formatCkbDigits(index)

              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSection(row.id!)}
                    className={cn(
                      "group flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-start transition-colors",
                      isActive
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-2 size-1.5 shrink-0 rounded-full transition-colors",
                        isActive ? "bg-primary" : "bg-border",
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="text-muted-foreground block font-mono text-[10px]">
                        {sortLabel}
                      </span>
                      <span
                        className={cn(
                          "line-clamp-2 text-sm leading-snug",
                          isActive && "font-semibold",
                        )}
                      >
                        {title}
                      </span>
                      <span className="mt-1 inline-block scale-90 origin-right">
                        <ServiceStatusPill service={row} />
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="border-border border-t p-3">
        <Button
          type="button"
          variant={selectedId === "new" ? "default" : "outline"}
          className="w-full gap-2"
          onClick={onAddSection}
        >
          <PlusIcon className="size-4 rtl:rotate-180" />
          {NS.action.addSection}
        </Button>
      </div>
    </nav>
  )
}
