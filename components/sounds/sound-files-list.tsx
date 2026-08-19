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
import { useRef, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { SoundFileCard } from "@/components/sounds/sound-file-card"
import { SoundFileSheet } from "@/components/sounds/sound-file-sheet"
import { NS } from "@/components/sounds/sounds-strings"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { formatEnDigits } from "@/lib/intl-ckb"
import {
  createEmptyFileRow,
  type SoundFormValues,
} from "@/lib/validations/sounds"
import { applyAudioFileMeta } from "@/lib/sound-audio-utils"

export function SoundFilesList() {
  const { control, watch, setValue, formState: { errors } } =
    useFormContext<SoundFormValues>()
  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: "files",
  })
  const trackState = watch("trackState")
  const [sheetIdx, setSheetIdx] = useState<number | null>(null)
  const bulkInputRef = useRef<HTMLInputElement>(null)

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

  function addFile() {
    append(createEmptyFileRow())
    setSheetIdx(fields.length)
  }

  async function onBulkFiles(files: FileList | null) {
    if (!files?.length) return
    const start = fields.length
    for (let i = 0; i < files.length; i++) {
      const file = files[i]!
      const meta = await applyAudioFileMeta(file)
      const baseTitle = file.name.replace(/\.[^.]+$/, "")
      append({
        ...createEmptyFileRow(),
        title: meta.title?.trim() || baseTitle,
        stagedAudioFile: file,
        ...meta,
      })
      if (i === 0) setSheetIdx(start)
    }
  }

  return (
    <section className="mt-12 space-y-4 border-t border-border/60 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium">
          {NS.section.files} ({formatEnDigits(fields.length)})
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={bulkInputRef}
            type="file"
            accept="audio/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              void onBulkFiles(e.target.files)
              e.target.value = ""
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => bulkInputRef.current?.click()}
          >
            {NS.action.add_multiple_files}
          </Button>
          <Button type="button" size="sm" onClick={addFile}>
            <PlusIcon className="size-4" />
            {NS.action.new_file}
          </Button>
        </div>
      </div>

      {errors.files?.message ? (
        <FieldError>{errors.files.message as string}</FieldError>
      ) : null}

      {fields.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground text-sm">{NS.files.empty}</p>
          <Button type="button" onClick={addFile}>
            <PlusIcon className="size-4" />
            {NS.files.empty_cta}
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
                <SoundFileCard
                  key={field.id}
                  id={field.id}
                  index={index}
                  file={watch(`files.${index}`)}
                  onEdit={() => setSheetIdx(index)}
                  onRemove={() => remove(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <SoundFileSheet
        open={sheetIdx != null}
        onOpenChange={(o) => {
          if (!o) setSheetIdx(null)
        }}
        index={sheetIdx ?? 0}
        file={sheetIdx != null ? watch(`files.${sheetIdx}`) : null}
        onSave={(file) => {
          if (sheetIdx == null) return
          update(sheetIdx, file)
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
