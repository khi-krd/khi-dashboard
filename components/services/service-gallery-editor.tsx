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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { PlayIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useFieldArray, useFormContext } from "react-hook-form"

import { ServiceGalleryBulkUploader } from "@/components/services/service-gallery-bulk-uploader"
import { NS } from "@/components/services/services-strings"
import { cn } from "@/lib/utils"
import type { ServiceFormValues } from "@/lib/validations/services"

type GallerySlot = ServiceFormValues["galleryMedia"][number]

function previewUrl(slot: GallerySlot | undefined): string | null {
  const url = slot?.url?.trim()
  if (!url) return null
  if (slot?.type === "VIDEO") return slot.posterUrl?.trim() || url
  return url
}

export function ServiceGalleryEditor() {
  const { control, watch } = useFormContext<ServiceFormValues>()
  const { fields, remove, move } = useFieldArray({
    control,
    name: "galleryMedia",
  })

  const slots = watch("galleryMedia") ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    // The backend persists gallery order positionally (@OrderColumn
    // display_order), so moving the array is the whole job.
    move(oldIndex, newIndex)
  }

  return (
    <div className="space-y-3">
      <ServiceGalleryBulkUploader slotCount={slots.length} compact />

      {fields.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={rectSortingStrategy}
          >
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {fields.map((field, index) => (
                <SortableTile
                  key={field.id}
                  fieldId={field.id}
                  slot={slots[index]}
                  onRemove={() => remove(index)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : null}
    </div>
  )
}

function SortableTile({
  fieldId,
  slot,
  onRemove,
}: {
  fieldId: string
  slot: GallerySlot | undefined
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fieldId })

  const thumb = previewUrl(slot)
  const isVideo = slot?.type === "VIDEO"

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group border-border relative aspect-square cursor-grab touch-none overflow-hidden rounded-md border bg-muted/30 active:cursor-grabbing",
        isDragging && "z-10 shadow-lg ring-2 ring-primary/30",
      )}
      {...attributes}
      {...listeners}
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={slot?.alt ?? ""}
          className="size-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="text-muted-foreground flex size-full items-center justify-center text-xs">
          …
        </div>
      )}

      {isVideo ? (
        <span className="pointer-events-none absolute start-1.5 top-1.5 rounded bg-black/65 p-0.5 text-white">
          <PlayIcon className="size-3" />
        </span>
      ) : null}

      <button
        type="button"
        aria-label={NS.action.delete}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className={cn(
          "absolute end-1.5 top-1.5 flex size-6 items-center justify-center rounded-full",
          "bg-black/65 text-white opacity-0 transition-opacity group-hover:opacity-100",
          "focus-visible:opacity-100 focus-visible:outline-none",
        )}
      >
        <XMarkIcon className="size-3.5" />
      </button>
    </li>
  )
}
