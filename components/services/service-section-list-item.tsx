"use client"

import { TrashIcon } from "@heroicons/react/24/outline"

import { ServiceStatusPill } from "@/components/services/service-status-pill"
import { NS } from "@/components/services/services-strings"
import { galleryPreviewUrl } from "@/lib/services-media-normalize"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { ServiceAdminTableRow } from "@/types/services-ui"

export function ServiceSectionListItem({
  row,
  selected,
  onSelect,
  onDelete,
}: {
  row: ServiceAdminTableRow
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const thumb = galleryPreviewUrl(row)
  const sortLabel =
    typeof row.sortOrder === "number" && Number.isFinite(row.sortOrder)
      ? formatCkbDigits(row.sortOrder)
      : NS.dash

  return (
    <div
      className={cn(
        "group flex gap-3 rounded-lg border p-3 transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/30 hover:bg-muted/30",
      )}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-start gap-3 text-start"
        onClick={onSelect}
      >
        <div className="border-border bg-muted/40 relative size-12 shrink-0 overflow-hidden rounded-md border">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-muted-foreground flex size-full items-center justify-center text-[10px]">
              {NS.dash}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground font-mono text-[10px]">
              #{sortLabel}
            </span>
            <ServiceStatusPill service={row} className="scale-90" />
          </div>
          <p className="line-clamp-1 text-sm font-medium">
            {row.titleCkb?.trim() || row.titleKmr?.trim() || NS.section.unnamed}
          </p>
          {row.titleKmr?.trim() && row.titleCkb?.trim() ? (
            <p className="text-muted-foreground line-clamp-1 text-xs">
              {row.titleKmr}
            </p>
          ) : null}
        </div>
      </button>
      <button
        type="button"
        className="text-muted-foreground hover:text-destructive shrink-0 rounded p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        aria-label={NS.action.delete}
      >
        <TrashIcon className="size-4" />
      </button>
    </div>
  )
}
