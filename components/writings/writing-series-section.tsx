"use client"

import { RectangleStackIcon } from "@heroicons/react/24/outline"

import { NS } from "@/components/writings/writings-strings"
import { Badge } from "@/components/ui/badge"
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

export type SeriesMode = "standalone" | "primary" | "child"

function bookTitleOf(w: WritingDto): string {
  return w.ckbContent?.title?.trim() || w.kmrContent?.title?.trim() || NS.dash
}

function ModeButton({
  active,
  tone,
  onClick,
  children,
}: {
  active: boolean
  tone: "plain" | "blue"
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-4 py-2 text-sm font-medium transition-colors",
        active
          ? tone === "blue"
            ? "border-blue-500/20 bg-blue-500/10 text-blue-700 shadow-sm border dark:text-blue-400"
            : "border-primary/20 bg-primary/10 text-primary border shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

export function WritingSeriesSection({
  seriesMode,
  onSeriesModeChange,
  parentBookId,
  onParentBookIdChange,
  seriesTotalBooks,
  onSeriesTotalBooksChange,
  bookTitle,
  savedParentId,
  savedOrder,
  savedTotal,
  savedSeriesName,
  rootChildCount,
  parentError,
  excludeId,
}: {
  seriesMode: SeriesMode
  onSeriesModeChange: (m: SeriesMode) => void
  parentBookId: number | null | undefined
  onParentBookIdChange: (id: number | null) => void
  /** Primary mode — the declared "N books" total for the whole chain. */
  seriesTotalBooks: number | undefined
  onSeriesTotalBooksChange: (n: number | undefined) => void
  /** Live CKB title of THIS book — the derived series name in primary mode. */
  bookTitle: string
  /** Saved state for an existing child — shows its position instead of the preview. */
  savedParentId?: number | null
  savedOrder?: number | null
  savedTotal?: number | null
  savedSeriesName?: string | null
  /** How many books are attached when this book IS the saved root (0/undefined otherwise). */
  rootChildCount?: number
  parentError?: string
  /** Book being edited — it can never be its own series parent. */
  excludeId?: number
}) {
  const parentsQ = useSeriesParentsQuery()
  const parents = (parentsQ.data ?? []).filter((p) => p.id !== excludeId)
  const selectedParent = parents.find((p) => p.id === parentBookId)

  // A freshly picked parent → this book lands at the end of that chain. The
  // saved child keeps its recorded position when the parent is unchanged.
  const keepsSavedParent =
    parentBookId != null && savedParentId != null && parentBookId === savedParentId
  const nextOrder = (selectedParent?.seriesInfo?.memberCount ?? 0) + 1
  const nextTotal = Math.max(
    selectedParent?.seriesInfo?.plannedTotal ?? 0,
    nextOrder,
  )
  const parentIsRoot = selectedParent?.seriesInfo?.isParent === true

  const derivedName = bookTitle.trim()

  return (
    <section className="space-y-4">
      <Label className="text-muted-foreground text-xs uppercase">
        {NS.section.series}
      </Label>

      <div className="bg-muted/50 inline-flex flex-wrap gap-1 rounded-lg p-1">
        <ModeButton
          active={seriesMode === "standalone"}
          tone="plain"
          onClick={() => onSeriesModeChange("standalone")}
        >
          {NS.series.mode.standalone}
        </ModeButton>
        <ModeButton
          active={seriesMode === "primary"}
          tone="blue"
          onClick={() => onSeriesModeChange("primary")}
        >
          {NS.series.mode.primary}
        </ModeButton>
        <ModeButton
          active={seriesMode === "child"}
          tone="blue"
          onClick={() => onSeriesModeChange("child")}
        >
          {NS.series.mode.child}
        </ModeButton>
      </div>

      {rootChildCount != null && rootChildCount > 0 && seriesMode !== "primary" ? (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          {NS.series.root_note(formatCkbDigits(rootChildCount))}{" "}
          {NS.series.root_leave_warning}
        </p>
      ) : null}

      {seriesMode === "standalone" ? (
        <p className="text-muted-foreground text-xs">{NS.field.standalone_helper}</p>
      ) : null}

      {seriesMode === "primary" ? (
        <div className="space-y-3">
          <div className="rounded-md border border-blue-500/25 bg-blue-500/5 px-3 py-2.5">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
              {NS.series.primary_intro}
            </p>
            <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 text-xs">
              <RectangleStackIcon className="size-3.5 shrink-0" aria-hidden />
              {NS.series.series_name_label}:{" "}
              <span className="text-foreground font-medium">
                {derivedName || NS.dash}
              </span>
            </p>
            <p className="text-muted-foreground mt-0.5 text-[11px]">
              {NS.series.name_from_title}
            </p>
          </div>

          <div className="max-w-40 space-y-1">
            <Label className="text-xs">{NS.series.planned_label}</Label>
            <Input
              type="number"
              className="h-9"
              value={seriesTotalBooks ?? ""}
              onChange={(e) => {
                const v = e.target.value
                onSeriesTotalBooksChange(
                  v === "" ? undefined : Math.max(2, Number(v)),
                )
              }}
            />
            <p className="text-muted-foreground text-[10px]">
              {NS.series.planned_helper}
            </p>
          </div>
        </div>
      ) : null}

      {seriesMode === "child" ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">{NS.series.pick_parent}</Label>
            <Select
              value={parentBookId != null ? String(parentBookId) : ""}
              onValueChange={(v) => onParentBookIdChange(v ? Number(v) : null)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={NS.series.pick_parent} />
              </SelectTrigger>
              <SelectContent dir="rtl" className="max-h-64">
                {parents.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    <ParentOptionLabel parent={p} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {parentError ? <FieldError>{parentError}</FieldError> : null}
          </div>

          {selectedParent ? (
            <div className="rounded-md border border-blue-500/25 bg-blue-500/5 px-3 py-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted-foreground">
                  {NS.series.series_name_label}:
                </span>
                <span className="text-foreground font-medium">
                  {selectedParent.seriesInfo?.seriesName?.trim() ||
                    bookTitleOf(selectedParent)}
                </span>
                {parentIsRoot ? null : (
                  <Badge variant="secondary" className="rounded-md text-[10px]">
                    {NS.series.new_series_tag}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {keepsSavedParent && savedOrder != null && savedTotal != null
                  ? NS.series.book_in(
                      formatCkbDigits(savedOrder),
                      formatCkbDigits(savedTotal),
                    )
                  : NS.series.will_be(
                      formatCkbDigits(nextOrder),
                      formatCkbDigits(nextTotal),
                    )}
              </p>
            </div>
          ) : keepsSavedParent ? (
            <div className="rounded-md border border-blue-500/25 bg-blue-500/5 px-3 py-2.5 text-xs">
              {savedSeriesName?.trim() ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground">
                    {NS.series.series_name_label}:
                  </span>
                  <span className="text-foreground font-medium">
                    {savedSeriesName.trim()}
                  </span>
                </div>
              ) : null}
              {savedOrder != null && savedTotal != null ? (
                <p className="text-muted-foreground mt-1">
                  {NS.series.book_in(
                    formatCkbDigits(savedOrder),
                    formatCkbDigits(savedTotal),
                  )}
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="text-muted-foreground text-[11px]">
            {NS.series.unlink_hint}
          </p>
        </div>
      ) : null}
    </section>
  )
}

function ParentOptionLabel({ parent }: { parent: WritingDto }) {
  const isRoot = parent.seriesInfo?.isParent === true
  const count = parent.seriesInfo?.memberCount ?? 0
  return (
    <span className="block truncate text-start">
      {bookTitleOf(parent)}
      <span className="text-muted-foreground ms-2 text-[10px]">
        {isRoot
          ? `${NS.series.parent_badge} • ${NS.series.members_now(formatCkbDigits(count))}`
          : NS.series.mode.standalone}
      </span>
    </span>
  )
}
