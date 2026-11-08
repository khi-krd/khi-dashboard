"use client"

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useMemo, useState } from "react"

import { NS } from "@/components/projects/projects-strings"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { ProjectTypeOption } from "@/types/projects"

export type ProjectTypeValue = { nameCkb: string; nameKmr: string }

/** Project-type chips share the book picker's rhythm: tinted when offered,
 *  solid when picked, dashed for the one staged inside the create card. The
 *  hue stays on the primary token — the genre family gets colours, types
 *  keep the brand accent. */
const TYPE_CHIP = {
  pill: "bg-primary/10 text-primary border-primary/20",
  selected: "bg-primary text-primary-foreground border-primary",
}

const CHIP_BASE =
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-90"

/**
 * Multi-select project-type picker styled like the genre and topic pickers:
 * every managed type sits in the open as a toggle chip — no dropdown — with
 * the bilingual quick-add card underneath. Values the vocabulary no longer
 * offers stay selected and removable but cannot be re-added.
 */
export function ProjectTypeCombobox({
  items,
  values,
  onChange,
  onCreateInline,
  loading,
}: {
  items: ProjectTypeOption[]
  values: ProjectTypeValue[]
  onChange: (v: ProjectTypeValue[]) => void
  /** Fired only from the "add type" panel — lets the caller persist the new name into the managed vocabulary. */
  onCreateInline?: (option: ProjectTypeOption) => void
  loading?: boolean
}) {
  const [draftCkb, setDraftCkb] = useState("")
  const [draftKmr, setDraftKmr] = useState("")

  const selected = useMemo(
    () => new Set(values.map((v) => v.nameCkb)),
    [values],
  )
  const attached = useMemo(
    () =>
      loading
        ? []
        : values.filter(
            (v) => !items.some((t) => t.projectTypeCkb === v.nameCkb),
          ),
    [items, values, loading],
  )
  const hasAny = values.length > 0
  const isEmpty = !loading && items.length === 0

  const addValue = (ckb: string, kmr: string) => {
    const c = ckb.trim()
    if (!c) return
    if (values.some((v) => v.nameCkb === c)) return
    onChange([...values, { nameCkb: c, nameKmr: kmr.trim() }])
  }
  const removeValue = (ckb: string) =>
    onChange(values.filter((v) => v.nameCkb !== ckb))

  function addType() {
    const ckb = draftCkb.trim()
    const kmr = draftKmr.trim()
    if (!ckb) return
    onCreateInline?.({ projectTypeCkb: ckb, projectTypeKmr: kmr })
    addValue(ckb, kmr)
    setDraftCkb("")
    setDraftKmr("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">
          {hasAny
            ? NS.type.selected_count(formatCkbDigits(values.length))
            : NS.type.empty_helper}
        </span>
        {hasAny ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4 transition-colors"
          >
            {NS.type.clear_all}
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((t) => {
            const isOn = selected.has(t.projectTypeCkb)
            return (
              <button
                key={t.projectTypeCkb}
                type="button"
                onClick={() =>
                  isOn
                    ? removeValue(t.projectTypeCkb)
                    : addValue(t.projectTypeCkb, t.projectTypeKmr)
                }
                aria-pressed={isOn}
                title={t.projectTypeKmr || undefined}
                className={cn(
                  CHIP_BASE,
                  isOn ? TYPE_CHIP.selected : cn(TYPE_CHIP.pill, "opacity-80"),
                )}
              >
                {t.projectTypeCkb}
              </button>
            )
          })}
          {attached.map((v) => (
            <span
              key={v.nameCkb}
              className={cn(CHIP_BASE, TYPE_CHIP.selected)}
            >
              {v.nameCkb}
              <button
                type="button"
                onClick={() => removeValue(v.nameCkb)}
                aria-label="×"
              >
                <XMarkIcon className="size-3.5" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}

      {isEmpty ? (
        <p className="text-muted-foreground text-xs">{NS.type.empty_list}</p>
      ) : null}

      <section className="border-border/60 bg-card/50 space-y-3 rounded-xl border p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs font-medium">
            {NS.action.add_type}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-8 w-40"
            placeholder={NS.lang.ckb}
            value={draftCkb}
            onChange={(e) => setDraftCkb(e.target.value)}
          />
          <Input
            dir="ltr"
            className="h-8 w-40"
            placeholder="Kurmancî"
            value={draftKmr}
            onChange={(e) => setDraftKmr(e.target.value)}
          />
          <button
            type="button"
            onClick={addType}
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center gap-1 rounded-md border px-3 text-xs font-medium transition-colors"
          >
            <PlusIcon className="size-3.5" aria-hidden />
            {NS.action.add}
          </button>
        </div>
        <p className="text-muted-foreground text-xs">{NS.field.type_helper}</p>
      </section>
    </div>
  )
}
