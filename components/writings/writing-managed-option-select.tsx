"use client"

import { PlusIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { OPTION_PAGE, MO } from "@/components/writings/options/managed-options-strings"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useCreateManagedOption,
  useManagedOptionsQuery,
} from "@/hooks/useWritingOptions"
import { suggestGenreSlug } from "@/types/managed-option"
import { toastApiError } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { bookGenreLabel, type ManagedOptionKind } from "@/types/managed-option"

const CHIP_BASE =
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-90"
const CHIP_ON =
  "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-700 dark:border-emerald-700"
const CHIP_OFF =
  "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 opacity-80"

/**
 * Single-select chip picker for جۆری نووسین / چاپ — the genre picker's exact
 * badge language collapsed to one choice, with the same bilingual quick-add
 * card and a manage link. The selection is the option's managed id; nothing is
 * written until the book itself is saved.
 */
export function WritingManagedOptionSelect({
  kind,
  value,
  onChange,
  label,
  quickAddLabel,
  manageHref,
}: {
  kind: ManagedOptionKind
  value: number | null
  onChange: (id: number | null) => void
  label: string
  quickAddLabel?: string
  manageHref?: string
}) {
  const listQ = useManagedOptionsQuery(kind, false)
  const createMut = useCreateManagedOption(kind)
  const [showAdd, setShowAdd] = useState(false)
  const [nameCkb, setNameCkb] = useState("")
  const [nameKmr, setNameKmr] = useState("")

  const options = listQ.data ?? []
  // The picked id may belong to an option that has since been retired — show
  // it anyway so the editor can see (and remove) what the book actually holds.
  const missing = value != null && !options.some((o) => o.id === value)

  function quickAdd() {
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
          setNameCkb("")
          setNameKmr("")
          setShowAdd(false)
        },
        onError: (err) => toastApiError(err, MO.error.generic),
      },
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">{label}</span>
        {manageHref ? (
          <Link
            href={manageHref}
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 transition-colors hover:underline"
          >
            {MO.action.manage}
          </Link>
        ) : null}
      </div>

      {listQ.isLoading ? (
        <Skeleton className="h-8 w-full rounded-md" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((o) => {
            const on = value === o.id
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={on}
                title={o.nameKmr || undefined}
                onClick={() => onChange(on ? null : (o.id ?? null))}
                className={cn(CHIP_BASE, on ? CHIP_ON : CHIP_OFF)}
              >
                {bookGenreLabel(o)}
              </button>
            )
          })}
          {missing ? (
            <button
              type="button"
              aria-pressed="true"
              onClick={() => onChange(null)}
              className="bg-muted text-muted-foreground border-border inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium"
            >
              #{value}
            </button>
          ) : null}
        </div>
      )}

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline-offset-4 transition-colors hover:underline"
        >
          <PlusIcon className="size-3.5" aria-hidden />
          {quickAddLabel ?? `${MO.action.new} ${OPTION_PAGE[kind].item}`}
        </button>
        {showAdd ? (
          <div className="border-border/60 bg-card/50 space-y-2 rounded-lg border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                className="h-8 w-40"
                placeholder={MO.field.nameCkb}
                value={nameCkb}
                onChange={(e) => setNameCkb(e.target.value)}
              />
              <Input
                dir="ltr"
                className="h-8 w-40"
                placeholder={MO.field.nameKmr}
                value={nameKmr}
                onChange={(e) => setNameKmr(e.target.value)}
              />
              <button
                type="button"
                disabled={createMut.isPending}
                onClick={quickAdd}
                className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center gap-1 rounded-md border px-3 text-xs font-medium transition-colors"
              >
                {MO.action.new}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
