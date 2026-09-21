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
import { useFieldArray, useFormContext } from "react-hook-form"

import { SoundAttachmentRow } from "@/components/sounds/sound-attachment-row"
import { NS } from "@/components/sounds/sounds-strings"
import { Button } from "@/components/ui/button"
import {
  createEmptyAttachmentRow,
  type SoundFormValues,
} from "@/lib/validations/sounds"

export function SoundAttachmentsList() {
  const { control } = useFormContext<SoundFormValues>()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "attachments",
  })

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
  }

  return (
    <section className="mt-12 space-y-4 border-t border-border/60 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium">{NS.section.attachments}</h2>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append(createEmptyAttachmentRow())}
        >
          <PlusIcon className="size-4" />
          {NS.action.new_attachment}
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
          {NS.attachment.empty}
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
            <ul className="space-y-3">
              {fields.map((field, index) => (
                <SoundAttachmentRow
                  key={field.id}
                  id={field.id}
                  index={index}
                  onRemove={() => remove(index)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  )
}
