"use client"

import {
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { useMemo, useState } from "react"

import { NS } from "@/components/writings/writings-strings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
            <SeriesParentCombobox
              parents={parents}
              value={parentBookId ?? null}
              onChange={onParentBookIdChange}
              loading={parentsQ.isLoading}
            />
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

/**
 * Searchable series picker — filters the already-loaded parents by title and
 * series name as the editor types, matching series by name rather than only
 * by scrolling a dropdown.
 */
function SeriesParentCombobox({
  parents,
  value,
  onChange,
  loading,
}: {
  parents: WritingDto[]
  value: number | null
  onChange: (id: number | null) => void
  loading?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState("")
  const q = typed.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!q) return parents
    return parents.filter((p) => {
      const hay = [
        p.ckbContent?.title,
        p.kmrContent?.title,
        p.seriesInfo?.seriesName,
        p.seriesName,
      ]
        .filter(Boolean)
        .join("\n")
        .toLowerCase()
      return hay.includes(q)
    })
  }, [parents, q])

  const selected = parents.find((p) => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex gap-1.5">
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-9 w-full justify-between rounded-md px-3 py-2 text-start font-normal"
            >
              {selected ? (
                <span className="truncate">{bookTitleOf(selected)}</span>
              ) : (
                <span className="text-muted-foreground">
                  {NS.series.pick_parent}
                </span>
              )}
              <ChevronUpDownIcon className="size-4 shrink-0 opacity-50" />
            </Button>
          }
        />
        {value != null ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-auto min-h-9 shrink-0"
            onClick={() => onChange(null)}
            aria-label={NS.action.cancel}
          >
            <XMarkIcon className="size-4" />
          </Button>
        ) : null}
      </div>
      <PopoverContent dir="rtl" className="w-[var(--anchor-width)] p-2">
        <div className="relative">
          <MagnifyingGlassIcon className="text-muted-foreground pointer-events-none absolute end-2.5 top-2.5 size-4" />
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={NS.series.pick_parent}
            className="h-9 pe-8"
            autoFocus
          />
        </div>
        <div className="mt-2 max-h-56 space-y-0.5 overflow-y-auto">
          {loading ? (
            <p className="text-muted-foreground px-2 py-1.5 text-xs">…</p>
          ) : null}
          {!loading && filtered.length === 0 ? (
            <p className="text-muted-foreground px-2 py-1.5 text-xs">
              {NS.series.no_match}
            </p>
          ) : null}
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              className={cn(
                "hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm",
                value === p.id && "bg-muted",
              )}
              onClick={() => {
                onChange(p.id ?? null)
                setOpen(false)
                setTyped("")
              }}
            >
              <ParentOptionLabel parent={p} />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
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
