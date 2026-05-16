"use client"

import { useCallback, useRef, useState, type SyntheticEvent } from "react"
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
import {
  Bars2Icon,
  PencilSquareIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useFieldArray, useFormContext } from "react-hook-form"

import { ProjectMediaSheet } from "@/components/projects/project-media-sheet"
import { NS } from "@/components/projects/projects-strings"
import { Button } from "@/components/ui/button"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { ProjectFormValues } from "@/lib/validations/projects"
import type { ProjectMediaType } from "@/types/projects"
import { cn } from "@/lib/utils"

function guessType(f: File): ProjectMediaType {
  if (f.type.startsWith("image/")) return "IMAGE"
  if (f.type.startsWith("video/")) return "VIDEO"
  if (f.type.startsWith("audio/")) return "AUDIO"
  if (f.type === "application/pdf") return "PDF"
  return "DOCUMENT"
}

function SortableTile({
  id,
  index,
  onEdit,
  onRemove,
}: {
  id: string
  index: number
  onEdit: () => void
  onRemove: () => void
}) {
  const { watch } = useFormContext<ProjectFormValues>()
  const item = watch(`mediaItems.${index}`)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const preview =
    item.stagedFile != null
      ? URL.createObjectURL(item.stagedFile)
      : item.url?.trim() || null
  const caption = item.caption?.trim()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group border-border relative aspect-square overflow-hidden rounded-lg border"
    >
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="size-full object-cover" />
      ) : (
        <div className="bg-muted flex size-full items-center justify-center">
          <PhotoIcon className="text-muted-foreground size-8" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent px-2 pb-2 pt-6">
        <p
          className={cn(
            "line-clamp-2 text-xs",
            caption ? "text-foreground/90" : "text-muted-foreground/60 opacity-0 group-hover:opacity-100",
          )}
        >
          {caption || NS.field.caption_add}
        </p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
        <button type="button" className="rounded-md bg-background/90 p-1.5" onClick={onEdit}>
          <PencilSquareIcon className="size-4" />
        </button>
        <button
          type="button"
          className="rounded-md bg-background/90 p-1.5 text-destructive"
          onClick={onRemove}
        >
          <TrashIcon className="size-4" />
        </button>
        <button
          type="button"
          className="rounded-md bg-background/90 p-1.5 cursor-grab"
          {...attributes}
          {...listeners}
        >
          <Bars2Icon className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function ProjectMediaGallery() {
  const { control } = useFormContext<ProjectFormValues>()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "mediaItems",
  })
  const fileRef = useRef<HTMLInputElement>(null)
  const [sheetIdx, setSheetIdx] = useState<number | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const ingest = useCallback(
    (list: FileList | File[]) => {
      for (const file of Array.from(list)) {
        append({
          mediaType: guessType(file),
          url: null,
          externalUrl: null,
          embedUrl: null,
          caption: "",
          stagedFile: file,
        })
      }
    },
    [append],
  )

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    const oldIdx = fields.findIndex((f) => f.id === e.active.id)
    const newIdx = fields.findIndex((f) => f.id === e.over!.id)
    if (oldIdx >= 0 && newIdx >= 0) move(oldIdx, newIdx)
  }

  function onDrop(ev: SyntheticEvent) {
    ev.preventDefault()
    const fs = (ev as unknown as DragEvent).dataTransfer?.files
    if (fs?.length) ingest(fs)
  }

  return (
    <section className="mt-12 border-t border-border/60 pt-6" dir="rtl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">
          {NS.section.media}{" "}
          <span className="text-muted-foreground font-normal">
            ({formatCkbDigits(fields.length)})
          </span>
        </h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              append({
                mediaType: "VIDEO",
                url: null,
                externalUrl: null,
                embedUrl: null,
                caption: "",
                stagedFile: null,
              })
              setSheetIdx(fields.length)
            }}
          >
            {NS.action.add_link}
          </Button>
          <Button type="button" size="sm" onClick={() => fileRef.current?.click()}>
            {NS.action.add_file}
          </Button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        className="sr-only"
        multiple
        onChange={(e) => {
          if (e.target.files?.length) ingest(e.target.files)
          e.target.value = ""
        }}
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={rectSortingStrategy}>
          <div
            className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            <button
              type="button"
              className={cn(
                "border-muted-foreground/30 hover:border-primary hover:bg-primary/5 col-span-2 flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed md:col-span-1",
                fields.length === 0 && "md:col-span-2",
              )}
              onClick={() => fileRef.current?.click()}
            >
              <PlusIcon className="size-8 text-muted-foreground" />
              <span className="text-muted-foreground px-4 text-center text-xs">
                {NS.field.media_helper}
              </span>
            </button>
            {fields.map((field, index) => (
              <SortableTile
                key={field.id}
                id={field.id}
                index={index}
                onEdit={() => setSheetIdx(index)}
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <ProjectMediaSheet
        index={sheetIdx}
        open={sheetIdx != null}
        onOpenChange={(o) => !o && setSheetIdx(null)}
        onDelete={() => {
          if (sheetIdx != null) remove(sheetIdx)
          setSheetIdx(null)
        }}
      />
    </section>
  )
}
