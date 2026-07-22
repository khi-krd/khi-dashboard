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

import { VideoSourceBulkUploader } from "@/components/videos/video-source-bulk-uploader"
import { VideoSourceCard } from "@/components/videos/video-source-card"
import { VideoSourceItemSheet } from "@/components/videos/video-source-item-sheet"
import { NS } from "@/components/videos/videos-strings"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { formatEnDigits } from "@/lib/intl-ckb"
import type { VideoFormValues } from "@/lib/validations/videos"

type Source = VideoFormValues["videoSources"][number]

function ensureSingleMain(sources: Source[]): Source[] {
  const mainIdx = sources.findIndex((s) => s.main)
  if (mainIdx < 0 && sources.length > 0) {
    return sources.map((s, i) => ({ ...s, main: i === 0 }))
  }
  if (mainIdx >= 0) {
    return sources.map((s, i) => ({ ...s, main: i === mainIdx }))
  }
  return sources
}

export function VideoSourceList() {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<VideoFormValues>()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "videoSources",
  })
  const [sheetIdx, setSheetIdx] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function markSourcesTouched() {
    setValue("sourcesTouched", true, { shouldDirty: true })
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    move(oldIndex, newIndex)
    markSourcesTouched()
  }

  function addSource() {
    const existing = watch("videoSources")
    const isFirst = existing.length === 0
    append({
      url: "",
      externalUrl: "",
      embedUrl: "",
      main: isFirst,
      label: "",
      durationSeconds: null,
      resolution: "",
      fileFormat: "",
      fileSizeMb: null,
      stagedVideoFile: null,
    })
    markSourcesTouched()
    setSheetIdx(fields.length)
  }

  function saveSource(index: number, source: Source) {
    const sources = watch("videoSources").map((s, i) => {
      if (i === index) return source
      if (source.main) return { ...s, main: false }
      return s
    })
    setValue("videoSources", ensureSingleMain(sources), { shouldDirty: true })
    markSourcesTouched()
  }

  function removeSource(index: number) {
    remove(index)
    const remaining = watch("videoSources")
    if (remaining.length > 0 && !remaining.some((s) => s.main)) {
      setValue("videoSources.0.main", true, { shouldDirty: true })
    }
    markSourcesTouched()
    setSheetIdx(null)
  }

  return (
    <section className="mt-12 flex flex-col gap-4 border-t border-border/60 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium">
          {NS.section.source} ({formatEnDigits(fields.length)})
        </h2>
        <Button type="button" size="sm" onClick={addSource}>
          <PlusIcon className="size-4" />
          {NS.source.new_source}
        </Button>
      </div>

      <VideoSourceBulkUploader sourceCount={fields.length} />

      {fields.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">
          {NS.source.empty}
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
                <VideoSourceCard
                  key={field.id}
                  id={field.id}
                  index={index}
                  source={watch(`videoSources.${index}`)}
                  onEdit={() => setSheetIdx(index)}
                  onRemove={() => removeSource(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <FieldError>{errors.videoSources?.message as string}</FieldError>

      <VideoSourceItemSheet
        open={sheetIdx != null}
        onOpenChange={(o) => {
          if (!o) setSheetIdx(null)
        }}
        source={sheetIdx != null ? watch(`videoSources.${sheetIdx}`) : null}
        onSave={(source) => {
          if (sheetIdx == null) return
          saveSource(sheetIdx, source)
        }}
        onDelete={() => {
          if (sheetIdx == null) return
          removeSource(sheetIdx)
        }}
      />
    </section>
  )
}
