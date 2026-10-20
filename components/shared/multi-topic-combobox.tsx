"use client"

import { CheckIcon, ChevronUpDownIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

function topicLabel(t: TopicOption | undefined, fallback: string) {
  if (!t) return fallback
  return t.nameCkb || t.nameKmr || fallback
}

/**
 * Shared multi-select topic picker: chips for every selected (or
 * pending-new) topic, a popover checklist of the managed vocabulary, and an
 * inline create panel for a brand-new bilingual topic.
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
}) {
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [nameCkb, setNameCkb] = useState("")
  const [nameKmr, setNameKmr] = useState("")

  const selected = selectedIds
    .map((id) => topics.find((t) => t.id === id))
    .filter((t): t is TopicOption => t != null)
  const unknownIds = selectedIds.filter(
    (id) => !topics.some((t) => t.id === id),
  )
  const hasAny = selectedIds.length > 0 || pending.length > 0

  return (
    <div className="space-y-2">
      {hasAny ? (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((t) => (
            <span
              key={t.id}
              className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
            >
              {topicLabel(t, `#${t.id}`)}
              <button
                type="button"
                onClick={() => onToggle(t)}
                aria-label="×"
              >
                <XMarkIcon className="size-3.5" />
              </button>
            </span>
          ))}
          {unknownIds.map((id) => (
            <span
              key={id}
              className="bg-muted text-muted-foreground border-border inline-flex items-center rounded-md border px-2 py-1 text-xs"
            >
              #{id}
            </span>
          ))}
          {pending.map((p, i) => (
            <span
              key={`new-${i}`}
              className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs dark:text-emerald-400"
            >
              + {p.nameCkb || p.nameKmr}
              <button
                type="button"
                onClick={() => onRemovePending(i)}
                aria-label="×"
              >
                <XMarkIcon className="size-3.5" />
              </button>
            </span>
          ))}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground px-1 text-xs underline"
            onClick={onClearAll}
          >
            ×
          </button>
        </div>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-between"
            >
              {hasAny
                ? `${selectedIds.length + pending.length}`
                : triggerPlaceholder}
              <ChevronUpDownIcon className="size-4 shrink-0 opacity-50" />
            </Button>
          }
        />
        <PopoverContent className="w-72 p-2" align="start">
          <ul className="max-h-48 space-y-1 overflow-y-auto">
            {loading ? (
              <li className="text-muted-foreground px-2 py-1.5 text-xs">…</li>
            ) : null}
            {topics.map((t) => {
              const checked = selectedIds.includes(t.id)
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    className={cn(
                      "hover:bg-muted flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-start text-sm",
                      checked && "bg-muted",
                    )}
                    onClick={() => onToggle(t)}
                  >
                    <CheckIcon
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        checked ? "text-primary opacity-100" : "opacity-0",
                      )}
                    />
                    <span>
                      <span className="block font-medium">{t.nameCkb}</span>
                      {t.nameKmr ? (
                        <span className="text-muted-foreground block text-xs">
                          {t.nameKmr}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {showCreate ? (
            <div className="border-border mt-2 space-y-2 border-t pt-2">
              <Input
                placeholder={ckbPlaceholder}
                value={nameCkb}
                onChange={(e) => setNameCkb(e.target.value)}
              />
              <Input
                placeholder={kmrPlaceholder}
                dir="ltr"
                value={nameKmr}
                onChange={(e) => setNameKmr(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                className="w-full"
                onClick={() => {
                  if (!nameCkb.trim() && !nameKmr.trim()) return
                  onCreateInline({ nameCkb: nameCkb.trim(), nameKmr: nameKmr.trim() })
                  setShowCreate(false)
                  setNameCkb("")
                  setNameKmr("")
                }}
              >
                {applyLabel}
              </Button>
            </div>
          ) : (
            <button
              type="button"
              className="text-primary mt-2 flex w-full items-center gap-1 px-2 py-1.5 text-xs"
              onClick={() => setShowCreate(true)}
            >
              <PlusIcon className="size-4" />
              {addLabel}
            </button>
          )}
        </PopoverContent>
      </Popover>
      {helperText ? (
        <p className="text-muted-foreground text-xs">{helperText}</p>
      ) : null}
    </div>
  )
}
