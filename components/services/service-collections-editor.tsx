"use client"

import { useState } from "react"
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { FolderIcon, PlusIcon } from "@heroicons/react/24/outline"
import { useFieldArray, useFormContext } from "react-hook-form"

import { ServiceCollectionSection } from "@/components/services/service-collection-section"
import { ServiceFormSectionCard } from "@/components/services/service-form-section-card"
import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { ServiceFormValues } from "@/lib/validations/services"
import type { ServiceMediaType } from "@/types/services"

function SortableCollectionWrapper({
  id,
  collectionIndex,
  onRemove,
}: {
  id: string
  collectionIndex: number
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ServiceCollectionSection
        collectionIndex={collectionIndex}
        onRemoveCollection={onRemove}
      />
    </div>
  )
}

export function ServiceCollectionsEditor() {
  const { control } = useFormContext<ServiceFormValues>()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "mediaCollections",
  })

  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<ServiceMediaType>("IMAGE")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const onCollectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    if (oldIndex >= 0 && newIndex >= 0) move(oldIndex, newIndex)
  }

  const confirmAdd = () => {
    if (!newName.trim()) return
    append({
      collectionName: newName.trim(),
      mediaType: newType,
      sortOrder: fields.length,
      files: [],
    })
    setNewName("")
    setNewType("IMAGE")
    setShowAdd(false)
  }

  const countBadge = (
    <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs font-medium">
      {formatCkbDigits(fields.length)}
    </span>
  )

  return (
    <ServiceFormSectionCard
      title={NS.section.mediaCollections}
      badge={countBadge}
      className="mt-6"
    >
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <Button type="button" size="sm" onClick={() => setShowAdd((v) => !v)}>
          <PlusIcon className="size-4 rtl:rotate-180" />
          {NS.action.add_collection}
        </Button>
      </div>

      {showAdd ? (
        <div className="border-border bg-muted/20 mb-6 space-y-3 rounded-lg border p-4">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={NS.collection.namePlaceholder}
          />
          <div className="flex flex-wrap gap-2">
            {(["IMAGE", "VIDEO", "AUDIO"] as const).map((t) => (
              <Button
                key={t}
                type="button"
                size="sm"
                variant={newType === t ? "default" : "outline"}
                onClick={() => setNewType(t)}
              >
                {t === "IMAGE"
                  ? NS.collection.mediaTypeImage
                  : t === "VIDEO"
                    ? NS.collection.mediaTypeVideo
                    : NS.collection.mediaTypeAudio}
              </Button>
            ))}
          </div>
          <Button type="button" size="sm" onClick={confirmAdd}>
            {NS.collection.addButton}
          </Button>
        </div>
      ) : null}

      {fields.length === 0 ? (
        <div className="border-muted-foreground/30 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <FolderIcon className="text-muted-foreground/50 size-10" />
          <div>
            <p className="font-medium">{NS.empty.no_collections.title}</p>
            <p className="text-muted-foreground text-sm">
              {NS.empty.no_collections.subtitle}
            </p>
          </div>
          <Button type="button" onClick={() => setShowAdd(true)}>
            <PlusIcon className="size-4" />
            {NS.action.add_first_collection}
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onCollectionDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-0">
              {fields.map((field, index) => (
                <SortableCollectionWrapper
                  key={field.id}
                  id={field.id}
                  collectionIndex={index}
                  onRemove={() => remove(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </ServiceFormSectionCard>
  )
}
