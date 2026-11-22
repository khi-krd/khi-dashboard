"use client"

import { CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import { toast } from "sonner"

import { MO } from "@/components/writings/options/managed-options-strings"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useCreateManagedOption,
  useManagedOptionsQuery,
} from "@/hooks/useWritingOptions"
import { toastApiError } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  bookGenreLabel,
  suggestGenreSlug,
  type ManagedOptionKind,
} from "@/types/managed-option"

const SEGMENT =
  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
const SEGMENT_ON = "bg-primary/10 text-primary border-primary/20 border shadow-sm"
const SEGMENT_OFF = "text-muted-foreground hover:text-foreground"

/**
 * Single-select managed vocabulary in the film/clip toggle's segmented
 * style: every option is a segment (Kurmanji name under the Sorani one when
 * `showKmr`), the trailing "+" segment opens a bilingual quick-add that
 * creates the option and selects it.
 */
export function ManagedOptionSegments({
  kind,
  value,
  onChange,
  showKmr,
}: {
  kind: ManagedOptionKind
  value: number | null
  onChange: (id: number | null) => void
  showKmr?: boolean
}) {
  const listQ = useManagedOptionsQuery(kind, false)
  const createMut = useCreateManagedOption(kind)
  const [adding, setAdding] = useState(false)
  const [nameCkb, setNameCkb] = useState("")
  const [nameKmr, setNameKmr] = useState("")

  const options = listQ.data ?? []

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
      {
        slug: suggestGenreSlug(kmr, ckb) || `OPT_${Date.now()}`,
        nameCkb: ckb || null,
        nameKmr: kmr || null,
        displayOrder: options.length,
        active: true,
      },
      {
        onSuccess: (created) => {
          toast.success(MO.toast.created)
          if (created?.id != null) onChange(created.id)
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
        {options.map((o) => {
          const on = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? null : (o.id ?? null))}
              className={cn(SEGMENT, on ? SEGMENT_ON : SEGMENT_OFF)}
            >
              {showKmr && o.nameKmr && o.nameKmr !== o.nameCkb ? (
                <span className="flex flex-col items-start leading-tight">
                  <span>{bookGenreLabel(o)}</span>
                  <span dir="ltr" className="text-[11px] font-normal opacity-70">
                    {o.nameKmr}
                  </span>
                </span>
              ) : (
                bookGenreLabel(o)
              )}
            </button>
          )
        })}
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
              }
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
              }
            }}
          />
          <button
            type="button"
            aria-label={MO.action.new}
            disabled={createMut.isPending}
            onClick={save}
            className={cn(SEGMENT, SEGMENT_ON, "px-3")}
          >
            <CheckIcon className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="×"
            onClick={closeAdd}
            className={cn(SEGMENT, SEGMENT_OFF, "px-3")}
          >
            <XMarkIcon className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  )
}
