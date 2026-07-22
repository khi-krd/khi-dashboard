"use client"

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { PlusIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { ServiceGalleryBulkUploader } from "@/components/services/service-gallery-bulk-uploader"
import { ServiceGalleryCard } from "@/components/services/service-gallery-card"
import { ServiceGalleryItemSheet } from "@/components/services/service-gallery-item-sheet"
import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import { formatCkbDigits } from "@/lib/intl-ckb"
import {
  createEmptyGallerySlot,
  type ServiceFormValues,
} from "@/lib/validations/services"

export function ServiceGalleryList() {
  const { control, watch, setValue } = useFormContext<ServiceFormValues>()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "galleryMedia",
  })
  const [sheetIdx, setSheetIdx] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    move(oldIndex, newIndex)
    setValue("galleryMedia", watch("galleryMedia"), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  function addSlot() {
    append(createEmptyGallerySlot())
    setSheetIdx(fields.length)
  }

  function saveSlotAt(
    index: number,
    slot: ServiceFormValues["galleryMedia"][number],
  ) {
    const current = watch("galleryMedia")
    const next = current.map((s, i) => (i === index ? slot : s))
    setValue("galleryMedia", next, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  function removeSlot(index: number) {
    remove(index)
    setSheetIdx(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">
            {NS.gallery.section} ({formatCkbDigits(fields.length)})
          </p>
          <p className="text-muted-foreground text-xs">
            {NS.gallery.sectionHelper}
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addSlot}>
          <PlusIcon className="size-4" />
          {NS.gallery.addSlot}
        </Button>
      </div>

      <ServiceGalleryBulkUploader slotCount={fields.length} />

      {fields.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">
          {NS.gallery.empty}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <ServiceGalleryCard
                  key={field.id}
                  id={field.id}
                  index={index}
                  slot={watch(`galleryMedia.${index}`)}
                  onEdit={() => setSheetIdx(index)}
                  onRemove={() => removeSlot(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ServiceGalleryItemSheet
        open={sheetIdx != null}
        onOpenChange={(o) => {
          if (!o) setSheetIdx(null)
        }}
        index={sheetIdx ?? 0}
        slot={sheetIdx != null ? watch(`galleryMedia.${sheetIdx}`) : null}
        onSave={(slot) => {
          if (sheetIdx == null) return
          saveSlotAt(sheetIdx, slot)
        }}
        onDelete={() => {
          if (sheetIdx == null) return
          removeSlot(sheetIdx)
        }}
      />
    </div>
  )
}
