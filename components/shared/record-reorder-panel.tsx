"use client"

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Bars2Icon, Squares2X2Icon } from "@heroicons/react/24/outline"
import Image from "next/image"
import { useState } from "react"

import { useSyncedState } from "@/hooks/use-synced-state"
import { isOptimizableImageSrc } from "@/lib/image-src"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export type ReorderItem = {
  id: number
  title: string
  subtitle?: string | null
  coverUrl?: string | null
}

/**
 * Full-list drag & drop ordering. The caller supplies every record (the list
 * is not paged inside this panel — ordering must see the whole set) and an
 * `onReorder` that persists `orderedIds`. The visual order updates
 * optimistically and rolls back when the save rejects.
 *
 * Each row offers two ways to reorder, both writing the same state: a drag
 * handle and a numeric position input (type a 1-based rank, Enter/blur to
 * commit — the row moves to that position and saves).
 */
export function RecordReorderPanel({
  items,
  isLoading,
  isSaving,
  onReorder,
  dragLabel,
  positionLabel,
}: {
  items: ReorderItem[]
  isLoading?: boolean
  isSaving?: boolean
  onReorder: (orderedIds: number[]) => Promise<void>
  dragLabel: string
  /** Accessible label for the numeric position input; falls back to dragLabel. */
  positionLabel?: string
}) {
  // Local order re-seeds whenever the fetched set changes — `items` must be a
  // stable reference between renders or the drag result is wiped mid-flight.
  const [ordered, setOrdered] = useSyncedState<ReorderItem[]>(
    [items],
    () => items,
    () => items,
  )
  const [pending, setPending] = useState(false)
  const busy = pending || isSaving

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  async function moveItem(oldIndex: number, newIndex: number) {
    if (
      oldIndex === newIndex ||
      oldIndex < 0 ||
      newIndex < 0 ||
      oldIndex >= ordered.length ||
      newIndex >= ordered.length
    ) {
      return
    }

    const previous = ordered
    const next = arrayMove(ordered, oldIndex, newIndex)
    setOrdered(next)
    setPending(true)
    try {
      await onReorder(next.map((item) => item.id))
    } catch {
      setOrdered(previous)
    } finally {
      setPending(false)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ordered.findIndex((item) => item.id === active.id)
    const newIndex = ordered.findIndex((item) => item.id === over.id)
    await moveItem(oldIndex, newIndex)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(e) => void handleDragEnd(e)}
    >
      <SortableContext
        items={ordered.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {ordered.map((item, index) => (
            <SortableRow
              key={item.id}
              item={item}
              order={index}
              total={ordered.length}
              disabled={busy}
              dragLabel={dragLabel}
              positionLabel={positionLabel ?? dragLabel}
              onMove={(targetIndex) => void moveItem(index, targetIndex)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({
  item,
  order,
  total,
  disabled,
  dragLabel,
  positionLabel,
  onMove,
}: {
  item: ReorderItem
  order: number
  total: number
  disabled?: boolean
  dragLabel: string
  positionLabel: string
  onMove: (targetIndex: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "group border-border bg-card relative flex items-center gap-3 rounded-xl border p-3 shadow-sm transition-shadow",
        isDragging && "z-10 shadow-lg ring-2 ring-primary/20",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground flex shrink-0 cursor-grab touch-none items-center rounded-md p-1.5 transition-colors active:cursor-grabbing"
        aria-label={dragLabel}
        {...attributes}
        {...listeners}
      >
        <Bars2Icon className="size-5" aria-hidden />
      </button>

      <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-lg">
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt=""
            fill
            className="object-cover"
            unoptimized={!isOptimizableImageSrc(item.coverUrl)}
          />
        ) : (
          <div className="text-muted-foreground/40 flex h-full w-full items-center justify-center">
            <Squares2X2Icon className="size-5" aria-hidden />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <PositionInput
            order={order}
            total={total}
            label={positionLabel}
            onCommit={onMove}
          />
        </div>
        <p className="line-clamp-1 text-base font-medium">{item.title || "—"}</p>
        {item.subtitle ? (
          <p className="text-muted-foreground line-clamp-1 text-sm">
            {item.subtitle}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Editable 1-based rank. Free typing is kept locally; Enter or blur commits:
 * the value is clamped into [1, total] and the row moves to that index.
 * Re-syncs to the live position whenever `order` changes (e.g. after a drag
 * or another row's move saved).
 */
function PositionInput({
  order,
  total,
  label,
  onCommit,
}: {
  order: number
  total: number
  label: string
  onCommit: (targetIndex: number) => void
}) {
  const [text, setText] = useSyncedState<string>(
    [order],
    () => String(order + 1),
    () => String(order + 1),
  )

  function commit(raw: string) {
    const parsed = Number.parseInt(raw.trim(), 10)
    if (!Number.isFinite(parsed)) {
      setText(String(order + 1))
      return
    }
    const clamped = Math.min(Math.max(parsed, 1), Math.max(total, 1))
    setText(String(clamped))
    if (clamped - 1 !== order) onCommit(clamped - 1)
  }

  return (
    <input
      type="number"
      step={1}
      inputMode="numeric"
      dir="ltr"
      aria-label={label}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          commit((e.target as HTMLInputElement).value)
          ;(e.target as HTMLInputElement).blur()
        }
      }}
      className="bg-primary/10 text-primary border-primary/20 focus-visible:ring-ring inline-flex h-7 w-14 shrink-0 items-center justify-center rounded-full border text-center font-mono text-xs font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2"
      title={formatCkbDigits(order + 1)}
    />
  )
}
