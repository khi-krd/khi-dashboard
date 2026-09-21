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
 */
export function RecordReorderPanel({
  items,
  isLoading,
  isSaving,
  onReorder,
  dragLabel,
}: {
  items: ReorderItem[]
  isLoading?: boolean
  isSaving?: boolean
  onReorder: (orderedIds: number[]) => Promise<void>
  dragLabel: string
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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ordered.findIndex((item) => item.id === active.id)
    const newIndex = ordered.findIndex((item) => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

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
              disabled={busy}
              dragLabel={dragLabel}
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
  disabled,
  dragLabel,
}: {
  item: ReorderItem
  order: number
  disabled?: boolean
  dragLabel: string
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
          <span className="bg-primary/10 text-primary inline-flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold tabular-nums">
            {formatCkbDigits(order + 1)}
          </span>
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
