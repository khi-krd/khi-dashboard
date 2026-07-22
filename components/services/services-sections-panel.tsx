"use client"

import { PlusIcon } from "@heroicons/react/24/outline"

import { ServiceSectionListItem } from "@/components/services/service-section-list-item"
import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { ServiceAdminTableRow } from "@/types/services-ui"

export function ServicesSectionsPanel({
  rows,
  selectedId,
  isLoading,
  onAddSection,
  onSelectSection,
  onDeleteSection,
}: {
  rows: ServiceAdminTableRow[]
  selectedId: number | "new" | null
  isLoading?: boolean
  onAddSection: () => void
  onSelectSection: (id: number) => void
  onDeleteSection: (row: ServiceAdminTableRow) => void
}) {
  const sorted = [...rows].sort(
    (a, b) => a.sortOrderValue - b.sortOrderValue,
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{NS.list.sectionsHeading}</h2>
        <span className="text-muted-foreground text-xs">
          {formatCkbDigits(sorted.length)}
        </span>
      </div>

      <Button
        type="button"
        className="w-full gap-2"
        onClick={onAddSection}
      >
        <PlusIcon className="size-4 rtl:rotate-180" />
        {NS.action.addSection}
      </Button>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed px-3 py-6 text-center text-sm">
          {NS.empty.no_services.subtitle}
        </p>
      ) : (
        <div className="max-h-[min(70vh,640px)] space-y-2 overflow-y-auto pe-1">
          {sorted.map((row) => {
            if (row.id == null) return null
            return (
              <ServiceSectionListItem
                key={row.id}
                row={row}
                selected={selectedId === row.id}
                onSelect={() => onSelectSection(row.id!)}
                onDelete={() => onDeleteSection(row)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
