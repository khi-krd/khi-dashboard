"use client"

import { CheckIcon, PlusIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import { toast } from "sonner"

import { MO } from "@/components/writings/options/managed-options-strings"
import { locationNameFor } from "@/components/shared/location-picker"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useCreateLocationMutation,
  useLocationsQuery,
} from "@/hooks/useTaxonomy"
import { toastApiError } from "@/lib/toast"
import { cn } from "@/lib/utils"
import type { LocationDto } from "@/types/taxonomy"

const SEGMENT =
  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
const SEGMENT_ON = "bg-primary/10 text-primary border-primary/20 border shadow-sm"
const SEGMENT_OFF = "text-muted-foreground hover:text-foreground"

function LocationTile({ loc, on, onClick }: { loc: LocationDto; on: boolean; onClick: () => void }) {
  const ckb = loc.nameCkb.trim()
  const kmr = loc.nameKmr.trim()
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(SEGMENT, on ? SEGMENT_ON : SEGMENT_OFF)}
    >
      {kmr && kmr !== ckb ? (
        <span className="flex flex-col items-start leading-tight">
          <span>{ckb || kmr}</span>
          <span dir="ltr" className="text-[11px] font-normal opacity-70">
            {kmr}
          </span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          {ckb || kmr}
          {on ? <CheckIcon className="size-3.5" aria-hidden /> : null}
        </span>
      )}
    </button>
  )
}

/**
 * Location vocabulary in the book-language segmented style: tiles carry the
 * Sorani name with the Kurmanji one beneath, and the trailing "+" opens a
 * bilingual quick-add. Single mode keeps one location; multi toggles.
 */
export function LocationOptionSegments({
  ckbValue,
  kmrValue,
  onPick,
  ckbValues,
  kmrValues,
  onToggle,
}: {
  /** single-select: stored Sorani name. */
  ckbValue?: string | null
  /** single-select: stored Kurmanji name. */
  kmrValue?: string | null
  onPick?: (loc: LocationDto | null) => void
  /** multi-select: stored Sorani names. */
  ckbValues?: string[]
  /** multi-select: stored Kurmanji names. */
  kmrValues?: string[]
  onToggle?: (loc: LocationDto, on: boolean) => void
}) {
  const multi = onToggle != null
  const listQ = useLocationsQuery()
  const createMut = useCreateLocationMutation()
  const [adding, setAdding] = useState(false)
  const [nameCkb, setNameCkb] = useState("")
  const [nameKmr, setNameKmr] = useState("")

  const options = listQ.data ?? []

  function isOn(loc: LocationDto): boolean {
    if (multi) {
      const ckb = locationNameFor(loc, "CKB")
      const kmr = locationNameFor(loc, "KMR")
      return (
        (ckbValues ?? []).includes(ckb) ||
        (kmrValues ?? []).includes(kmr)
      )
    }
    const ckb = (ckbValue ?? "").trim()
    const kmr = (kmrValue ?? "").trim()
    return (
      (ckb !== "" && (ckb === loc.nameCkb.trim() || ckb === locationNameFor(loc, "CKB"))) ||
      (kmr !== "" && (kmr === loc.nameKmr.trim() || kmr === locationNameFor(loc, "KMR")))
    )
  }

  function pick(loc: LocationDto) {
    if (multi) {
      onToggle?.(loc, !isOn(loc))
    } else {
      onPick?.(isOn(loc) ? null : loc)
    }
  }

  function closeAdd() {
    setAdding(false)
    setNameCkb("")
    setNameKmr("")
  }

  function save() {
    const ckb = nameCkb.trim()
    const kmr = nameKmr.trim()
    if (!ckb && !kmr) return
    createMut.mutate(
      { nameCkb: ckb || undefined, nameKmr: kmr || undefined },
      {
        onSuccess: (created) => {
          toast.success(MO.toast.created)
          if (created) {
            if (multi) onToggle?.(created, true)
            else onPick?.(created)
          }
          closeAdd()
        },
        onError: (err) => toastApiError(err, MO.error.generic),
      },
    )
  }

  if (listQ.isLoading) return <Skeleton className="h-11 w-64 rounded-lg" />

  return (
    <div className="space-y-2">
      <div className="bg-muted/50 inline-flex flex-wrap gap-1 rounded-lg p-1">
        {options.map((o) => (
          <LocationTile key={o.id} loc={o} on={isOn(o)} onClick={() => pick(o)} />
        ))}
        <button
          type="button"
          aria-label={MO.action.new}
          aria-expanded={adding}
          onClick={() => (adding ? closeAdd() : setAdding(true))}
          className={cn(SEGMENT, "px-3", adding ? SEGMENT_ON : SEGMENT_OFF)}
        >
          <PlusIcon className="size-4" aria-hidden />
        </button>
      </div>

      {adding ? (
        <div className="bg-muted/50 inline-flex flex-wrap items-center gap-1 rounded-lg p-1">
          <Input
            autoFocus
            className="bg-background h-9 w-44"
            placeholder={MO.field.nameCkb}
            value={nameCkb}
            onChange={(e) => setNameCkb(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                save()
              } else if (e.key === "Escape") closeAdd()
            }}
          />
          <Input
            dir="ltr"
            className="bg-background h-9 w-44"
            placeholder={MO.field.nameKmr}
            value={nameKmr}
            onChange={(e) => setNameKmr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                save()
              } else if (e.key === "Escape") closeAdd()
            }}
          />
          <button
            type="button"
            disabled={createMut.isPending || (!nameCkb.trim() && !nameKmr.trim())}
            onClick={save}
            className={cn(SEGMENT, SEGMENT_ON, "disabled:opacity-50")}
          >
            {createMut.isPending ? "…" : MO.action.save}
          </button>
        </div>
      ) : null}
    </div>
  )
}
