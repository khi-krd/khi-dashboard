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
import { Bars2Icon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import Image from "next/image"

import { useObjectUrl } from "@/hooks/use-object-url"
import { NS } from "@/components/sounds/sounds-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFileUpload } from "@/hooks/use-file-upload"
import type { BrochureFormValues } from "@/lib/validations/sounds"

function newBrochureKey() {
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function SoundFileBrochures({
  brochures,
  onChange,
}: {
  brochures: BrochureFormValues[]
  onChange: (next: BrochureFormValues[]) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function patchAt(i: number, patch: Partial<BrochureFormValues>) {
    const next = brochures.map((b, idx) => (idx === i ? { ...b, ...patch } : b))
    onChange(next)
  }

  function removeAt(i: number) {
    onChange(brochures.filter((_, idx) => idx !== i))
  }

  function addBrochure() {
    onChange([
      ...brochures,
      {
        clientKey: newBrochureKey(),
        imageUrl: "",
        caption: "",
        brochureOrder: brochures.length,
        stagedImageFile: null,
      },
    ])
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = brochures.findIndex((b) => b.clientKey === active.id)
    const newIndex = brochures.findIndex((b) => b.clientKey === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onChange(arrayMove(brochures, oldIndex, newIndex))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {NS.section.brochures}
        </h3>
        <Button type="button" size="sm" variant="outline" onClick={addBrochure}>
          <PlusIcon className="size-4" />
          {NS.action.new_brochure}
        </Button>
      </div>
      {brochures.length === 0 ? (
        <p className="text-muted-foreground text-xs">{NS.brochure.empty}</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={brochures.map((b) => b.clientKey)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-3">
              {brochures.map((b, i) => (
                <BrochureRow
                  key={b.clientKey}
                  id={b.clientKey}
                  brochure={b}
                  onPatch={(p) => patchAt(i, p)}
                  onRemove={() => removeAt(i)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function BrochureRow({
  id,
  brochure,
  onPatch,
  onRemove,
}: {
  id: string
  brochure: BrochureFormValues
  onPatch: (p: Partial<BrochureFormValues>) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const blob = useObjectUrl(brochure.stagedImageFile)


  const preview = blob || brochure.imageUrl?.trim() || null

  const [, { getInputProps, openFileDialog, removeFile }] = useFileUpload({
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    accept: "image/jpeg,image/png,image/webp",
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      onPatch({ stagedImageFile: entry.file, imageUrl: "" })
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="border-border bg-background flex gap-3 rounded-lg border p-3"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-md border">
        <input {...getInputProps()} className="sr-only" />
        {preview ? (
          <Image src={preview} alt="" fill className="object-cover" unoptimized />
        ) : (
          <button
            type="button"
            className="text-muted-foreground size-full text-[10px]"
            onClick={openFileDialog}
          >
            {NS.action.add}
          </button>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <Input
          value={brochure.caption ?? ""}
          onChange={(e) => onPatch({ caption: e.target.value })}
          placeholder={NS.field.brochure_caption_placeholder}
          className="h-8 text-xs"
        />
        <Input
          value={brochure.imageUrl ?? ""}
          onChange={(e) => onPatch({ imageUrl: e.target.value, stagedImageFile: null })}
          placeholder="https://"
          className="h-8 text-xs"
        />
      </div>
      <button type="button" className="text-muted-foreground hover:text-destructive shrink-0" onClick={onRemove}>
        <TrashIcon className="size-4" />
      </button>
      <button
        type="button"
        className="text-muted-foreground cursor-grab shrink-0"
        {...attributes}
        {...listeners}
        aria-label={NS.action.reorder}
      >
        <Bars2Icon className="size-4" />
      </button>
    </li>
  )
}
