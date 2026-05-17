"use client"

import { NS } from "@/components/writings/writings-strings"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSeriesParentsQuery } from "@/hooks/useWritings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { WritingDto } from "@/types/writings"

export type SeriesMode = "standalone" | "series"

export function WritingSeriesSection({
  seriesMode,
  onSeriesModeChange,
  parentBookId,
  onParentBookIdChange,
  seriesName,
  onSeriesNameChange,
  seriesOrder,
  onSeriesOrderChange,
  seriesTotalBooks,
  onSeriesTotalBooksChange,
  parentError,
}: {
  seriesMode: SeriesMode
  onSeriesModeChange: (m: SeriesMode) => void
  parentBookId: number | null | undefined
  onParentBookIdChange: (id: number | null) => void
  seriesName: string
  onSeriesNameChange: (s: string) => void
  seriesOrder: number
  onSeriesOrderChange: (n: number) => void
  seriesTotalBooks: number | undefined
  onSeriesTotalBooksChange: (n: number | undefined) => void
  parentError?: string
}) {
  const parentsQ = useSeriesParentsQuery()
  const parents = parentsQ.data ?? []

  return (
    <section className="space-y-4">
      <Label className="text-muted-foreground text-xs uppercase">
        {NS.section.series}
      </Label>

      <div className="bg-muted/50 inline-flex rounded-lg p-1">
        <button
          type="button"
          onClick={() => onSeriesModeChange("standalone")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            seriesMode === "standalone"
              ? "border-primary/20 bg-primary/10 text-primary border shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {NS.series.mode.standalone}
        </button>
        <button
          type="button"
          onClick={() => onSeriesModeChange("series")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            seriesMode === "series"
              ? "border-blue-500/20 bg-blue-500/10 text-blue-700 shadow-sm border dark:text-blue-400"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {NS.series.mode.part_of}
        </button>
      </div>

      {seriesMode === "standalone" ? (
        <p className="text-muted-foreground text-xs">{NS.field.standalone_helper}</p>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">{NS.series.dialog.series_picker}</Label>
            <Select
              value={parentBookId != null ? String(parentBookId) : ""}
              onValueChange={(v) => {
                const id = v ? Number(v) : null
                onParentBookIdChange(id)
                const hit = parents.find((p) => p.id === id)
                if (hit?.seriesName?.trim()) {
                  onSeriesNameChange(hit.seriesName.trim())
                }
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={NS.series.dialog.series_picker} />
              </SelectTrigger>
              <SelectContent dir="rtl" className="max-h-64">
                {parents.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    <SeriesParentLabel parent={p} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {parentError ? <FieldError>{parentError}</FieldError> : null}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{NS.field.series_name}</Label>
            <Input
              value={seriesName}
              onChange={(e) => onSeriesNameChange(e.target.value)}
              placeholder={NS.field.series_name}
              className="h-9"
              maxLength={300}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{NS.field.series_order}</Label>
              <Input
                type="number"
                min={1}
                className="h-9"
                value={seriesOrder}
                onChange={(e) =>
                  onSeriesOrderChange(Math.max(1, Number(e.target.value) || 1))
                }
              />
              <p className="text-muted-foreground text-[10px]">
                {NS.field.series_order_helper}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{NS.field.series_total}</Label>
              <Input
                type="number"
                min={1}
                className="h-9"
                value={seriesTotalBooks ?? ""}
                onChange={(e) => {
                  const v = e.target.value
                  onSeriesTotalBooksChange(
                    v === "" ? undefined : Math.max(1, Number(v)),
                  )
                }}
              />
              <p className="text-muted-foreground text-[10px]">
                {NS.field.series_total_helper}
              </p>
            </div>
          </div>

          {seriesTotalBooks != null && seriesTotalBooks > 0 ? (
            <p className="text-muted-foreground text-xs">
              {NS.series.total_books(formatCkbDigits(seriesTotalBooks))}
            </p>
          ) : null}
        </div>
      )}
    </section>
  )
}

function SeriesParentLabel({ parent }: { parent: WritingDto }) {
  const title = parent.ckbContent?.title?.trim() || NS.dash
  const series = parent.seriesName?.trim()
  return (
    <span className="block truncate text-start">
      {title}
      {series ? (
        <span className="text-muted-foreground ms-1 text-xs">({series})</span>
      ) : null}
    </span>
  )
}
