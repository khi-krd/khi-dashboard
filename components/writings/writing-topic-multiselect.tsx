"use client"

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useMemo, useState } from "react"

import type { PendingTopic } from "@/components/shared/multi-topic-combobox"
import { NS } from "@/components/writings/writings-strings"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useWritingTopicsQuery } from "@/hooks/useWritings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { TopicDto } from "@/types/writings"

/**
 * Topic chips are green everywhere — tinted when offered, solid when picked,
 * dashed for the ones staged for creation on the next save.
 */
const TOPIC_CHIP = {
  pill: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  selected:
    "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500",
  pending:
    "border-dashed bg-emerald-500/5 text-emerald-700 border-emerald-500/40 dark:text-emerald-400",
}

const CHIP_BASE =
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-90"

function topicLabel(t: TopicDto) {
  return t.nameCkb || t.nameKmr || `#${t.id}`
}

/**
 * The topic picker, styled like the genre picker: every managed topic as a
 * toggle chip, quick-add staged inline, and a link out to the topics page.
 * Props mirror the old combobox so the book form swaps it in unchanged —
 * `onCreateInline` stays a form-level stage (pending topics are created with
 * the book on save, not posted from here).
 */
export function WritingTopicMultiselect({
  selectedIds,
  pending,
  onToggle,
  onRemovePending,
  onCreateInline,
  onClearAll,
}: {
  selectedIds: number[]
  pending: PendingTopic[]
  onToggle: (t: TopicDto) => void
  onRemovePending: (index: number) => void
  onCreateInline: (names: { nameCkb: string; nameKmr: string }) => void
  onClearAll: () => void
}) {
  const topicsQ = useWritingTopicsQuery()
  const topics = useMemo(() => topicsQ.data ?? [], [topicsQ.data])
  const selected = useMemo(() => new Set(selectedIds), [selectedIds])

  /** Selected ids the vocabulary no longer offers — kept removable, like the
   *  genre picker's "attached" row. */
  const unknownIds = useMemo(
    () => selectedIds.filter((id) => !topics.some((t) => t.id === id)),
    [selectedIds, topics],
  )

  const [nameCkb, setNameCkb] = useState("")
  const [nameKmr, setNameKmr] = useState("")

  const totalSelected = selectedIds.length + pending.length
  const hasAny = totalSelected > 0
  const isEmpty =
    !topicsQ.isLoading && !topicsQ.isError && topics.length === 0

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
        <Label className="text-sm font-medium">{NS.section.topic}</Label>
        <span className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">
            {hasAny
              ? NS.genre.selected_count(formatCkbDigits(totalSelected))
              : NS.field.topic_unselected}
          </span>
          {hasAny ? (
            <button
              type="button"
              onClick={onClearAll}
              className="text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              {NS.field.topic_clear_all}
            </button>
          ) : null}
        </span>
      </div>

      {topicsQ.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => {
            const isOn = selected.has(topic.id)
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => onToggle(topic)}
                aria-pressed={isOn}
                className={cn(
                  CHIP_BASE,
                  isOn ? TOPIC_CHIP.selected : cn(TOPIC_CHIP.pill, "opacity-80"),
                )}
              >
                {topicLabel(topic)}
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
        </div>
      )}

      {isEmpty ? (
        <p className="text-muted-foreground text-xs">
          {NS.topics.empty.title}
        </p>
      ) : null}

      {unknownIds.length > 0 ? (
        <div className="flex flex-wrap gap-2">
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
      ) : null}

      <section className="border-border/60 bg-card/50 space-y-3 rounded-xl border p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs font-medium">
            {NS.action.new_topic}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-8 w-40"
            placeholder={NS.topic.name_ckb}
            value={nameCkb}
            onChange={(e) => setNameCkb(e.target.value)}
          />
          <Input
            dir="ltr"
            className="h-8 w-40"
            placeholder={NS.topic.name_kmr}
            value={nameKmr}
            onChange={(e) => setNameKmr(e.target.value)}
          />
          <button
            type="button"
            onClick={addTopic}
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center gap-1 rounded-md border px-3 text-xs font-medium transition-colors"
          >
            <PlusIcon className="size-3.5" aria-hidden />
            {NS.action.add}
          </button>
        </div>
        <p className="text-muted-foreground text-xs">
          {NS.field.topic_pending_hint}
        </p>
      </section>

      <Link
        href="/dashboard/writings/topics"
        className="text-muted-foreground hover:text-foreground inline-block text-xs underline-offset-4 transition-colors hover:underline"
      >
        {NS.topics.link}
      </Link>
    </div>
  )
}
