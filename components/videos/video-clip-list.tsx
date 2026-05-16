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

import { VideoAlbumToggle } from "@/components/videos/video-album-toggle"
import { VideoClipCard } from "@/components/videos/video-clip-card"
import { VideoClipItemSheet } from "@/components/videos/video-clip-item-sheet"
import { NS } from "@/components/videos/videos-strings"
import { Button } from "@/components/ui/button"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { VideoFormValues } from "@/lib/validations/videos"

export function VideoClipList() {
  const { control, watch, setValue } = useFormContext<VideoFormValues>()
  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: "videoClipItems",
  })
  const album = watch("albumOfMemories")
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
    const items = watch("videoClipItems")
    items.forEach((_, i) => {
      setValue(`videoClipItems.${i}.clipNumber`, i + 1, { shouldDirty: true })
    })
  }

  function addClip() {
    const n = fields.length + 1
    append({
      url: "",
      externalUrl: "",
      embedUrl: "",
      clipNumber: n,
      titleCkb: "",
      titleKmr: "",
      descriptionCkb: "",
      descriptionKmr: "",
    })
    setSheetIdx(fields.length)
  }

  return (
    <section className="mt-12 space-y-4 border-t border-border/60 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium">
          {NS.section.clips} ({formatCkbDigits(fields.length)})
        </h2>
        <div className="flex items-center gap-3">
          <VideoAlbumToggle
            checked={album}
            onCheckedChange={(v) =>
              setValue("albumOfMemories", v, { shouldDirty: true })
            }
          />
          <Button type="button" size="sm" onClick={addClip}>
            <PlusIcon className="size-4" />
            {NS.action.new_clip}
          </Button>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground text-sm">{NS.clip.empty}</p>
          <Button type="button" onClick={addClip}>
            <PlusIcon className="size-4" />
            {NS.clip.empty_cta}
          </Button>
        </div>
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
            <div className="space-y-3">
              {fields.map((field, index) => (
                <VideoClipCard
                  key={field.id}
                  id={field.id}
                  clip={watch(`videoClipItems.${index}`)}
                  onEdit={() => setSheetIdx(index)}
                  onRemove={() => remove(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <VideoClipItemSheet
        open={sheetIdx != null}
        onOpenChange={(o) => {
          if (!o) setSheetIdx(null)
        }}
        clip={sheetIdx != null ? watch(`videoClipItems.${sheetIdx}`) : null}
        onSave={(clip) => {
          if (sheetIdx == null) return
          update(sheetIdx, clip)
        }}
        onDelete={() => {
          if (sheetIdx == null) return
          remove(sheetIdx)
          setSheetIdx(null)
        }}
      />
    </section>
  )
}
