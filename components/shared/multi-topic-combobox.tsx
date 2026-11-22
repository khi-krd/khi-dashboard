"use client"

import {
  CheckIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"

export type TopicOption = {
  id: number
  nameCkb?: string | null
  nameKmr?: string | null
}

export type PendingTopic = {
  nameCkb?: string
  nameKmr?: string
}

/**
 * Offered chips stay neutral — the only green a chip ever shows is the solid
 * selected state (with a check), so "available" can never be mistaken for
 * "chosen". Staged-for-creation chips stay dashed green.
 */
const TOPIC_CHIP = {
  pill: "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground",
  selected:
    "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-700 dark:border-emerald-700",
  pending:
    "border-dashed bg-emerald-500/5 text-emerald-700 border-emerald-500/40 dark:text-emerald-400",
}

const CHIP_BASE =
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-90"

function topicLabel(t: TopicOption | undefined, fallback: string) {
  if (!t) return fallback
  return t.nameCkb || t.nameKmr || fallback
}

/**
 * Shared multi-select topic picker, styled like the writings topic picker and
 * the project-type chips: every managed topic sits in the open as a toggle
 * chip — no dropdown — with the bilingual quick-add card underneath.
 * Selected ids the vocabulary no longer offers stay selected and removable.
 */
export function MultiTopicCombobox({
  topics,
  selectedIds,
  pending,
  onToggle,
  onRemovePending,
  onCreateInline,
  onClearAll,
  triggerPlaceholder,
  addLabel,
  applyLabel,
  ckbPlaceholder,
  kmrPlaceholder,
  helperText,
  loading,
  selectedCountText,
  clearAllLabel,
  manageHref,
  manageLabel,
}: {
  topics: TopicOption[]
  selectedIds: number[]
  pending: PendingTopic[]
  onToggle: (t: TopicOption) => void
  onRemovePending: (index: number) => void
  onCreateInline: (names: { nameCkb: string; nameKmr: string }) => void
  onClearAll: () => void
  triggerPlaceholder: string
  addLabel: string
  applyLabel: string
  ckbPlaceholder: string
  kmrPlaceholder: string
  helperText?: string
  loading?: boolean
  selectedCountText?: (count: string) => string
  clearAllLabel?: string
  manageHref?: string
  manageLabel?: string
}) {
  const [nameCkb, setNameCkb] = useState("")
  const [nameKmr, setNameKmr] = useState("")

  const unknownIds = useMemo(
    () => selectedIds.filter((id) => !topics.some((t) => t.id === id)),
    [selectedIds, topics],
  )
  const hasAny = selectedIds.length > 0 || pending.length > 0
  const totalSelected = selectedIds.length + pending.length

  function addTopic() {
    const ckb = nameCkb.trim()
    const kmr = nameKmr.trim()
    if (!ckb && !kmr) return
    onCreateInline({ nameCkb: ckb, nameKmr: kmr })
    setNameCkb("")
    setNameKmr("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">
          {hasAny
            ? (selectedCountText?.(formatCkbDigits(totalSelected)) ??
              formatCkbDigits(totalSelected))
            : triggerPlaceholder}
        </span>
        {hasAny ? (
          <button
            type="button"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4 transition-colors"
          >
            {clearAllLabel ?? "×"}
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
          {topics.map((t) => {
            const isOn = selectedIds.includes(t.id)
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggle(t)}
                aria-pressed={isOn}
                title={t.nameKmr || undefined}
                className={cn(
                  CHIP_BASE,
                  isOn ? TOPIC_CHIP.selected : TOPIC_CHIP.pill,
                )}
              >
                {isOn ? (
                  <CheckIcon className="size-3" aria-hidden />
                ) : null}
                {topicLabel(t, `#${t.id}`)}
              </button>
            )
          })}
          {pending.map((p, i) => (
            <span
              key={`pending-${p.nameCkb ?? p.nameKmr ?? i}`}
              className={cn(CHIP_BASE, TOPIC_CHIP.pending)}
            >
              + {p.nameCkb || p.nameKmr}
              <button
                type="button"
                onClick={() => onRemovePending(i)}
                aria-label="×"
              >
                <XMarkIcon className="size-3.5" aria-hidden />
              </button>
            </span>
          ))}
          {unknownIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() =>
                onToggle({ id, nameCkb: `#${id}`, nameKmr: null })
              }
              className="bg-muted text-muted-foreground border-border inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium"
            >
              #{id}
            </button>
          ))}
        </div>
      )}

      <section className="border-border/60 bg-card/50 space-y-3 rounded-xl border p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs font-medium">
            {addLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-8 w-40"
            placeholder={ckbPlaceholder}
            value={nameCkb}
            onChange={(e) => setNameCkb(e.target.value)}
          />
          <Input
            dir="ltr"
            className="h-8 w-40"
            placeholder={kmrPlaceholder}
            value={nameKmr}
            onChange={(e) => setNameKmr(e.target.value)}
          />
          <button
            type="button"
            onClick={addTopic}
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center gap-1 rounded-md border px-3 text-xs font-medium transition-colors"
          >
            <PlusIcon className="size-3.5" aria-hidden />
            {applyLabel}
          </button>
        </div>
        {helperText ? (
          <p className="text-muted-foreground text-xs">{helperText}</p>
        ) : null}
      </section>

      {manageHref && manageLabel ? (
        <Link
          href={manageHref}
          className="text-muted-foreground hover:text-foreground inline-block text-xs underline-offset-4 transition-colors hover:underline"
        >
          {manageLabel}
        </Link>
      ) : null}
    </div>
  )
}
