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
import { CloudArrowUpIcon, PlusIcon } from "@heroicons/react/24/outline"
import { useFieldArray, useFormContext } from "react-hook-form"

import { SoundAlbumBrochureRow } from "@/components/sounds/sound-album-brochure-row"
import { NS } from "@/components/sounds/sounds-strings"
import { Button } from "@/components/ui/button"
import { useFileUpload } from "@/hooks/use-file-upload"
import { formatEnDigits } from "@/lib/intl-ckb"
import { guessAttachmentTypeFromMime } from "@/lib/sound-format"
import { cn } from "@/lib/utils"
import {
  createEmptyAlbumBrochureRow,
  type SoundFormValues,
} from "@/lib/validations/sounds"

/**
 * Album-level brochures — a list of files (PDFs, scanned page images …) that
 * belong to the sound track as a whole, independent of the audio files.
 * Files can be dropped onto / picked into the dashed zone (one row per file,
 * title seeded from the filename) or an empty row added for a pasted URL.
 */
export function SoundAlbumBrochuresList() {
  const { control } = useFormContext<SoundFormValues>()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "albumBrochures",
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

  function appendBrochureFile(file: File) {
    append({
      ...createEmptyAlbumBrochureRow(),
      title: file.name.replace(/\.[^.]+$/, ""),
      stagedFile: file,
      mimeType: file.type,
      sizeBytes: file.size,
      fileType: guessAttachmentTypeFromMime(file.type),
    })
  }

  const [{ isDragging }, { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps }] =
    useFileUpload({
      maxFiles: 50,
      maxSize: 50 * 1024 * 1024,
      multiple: true,
      accept: "image/*,application/pdf",
      onFilesAdded: (added) => {
        for (const entry of added) {
          if (entry.file instanceof File) appendBrochureFile(entry.file)
        }
      },
    })

  const dropzone = (compact: boolean) => (
    <div
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center transition-colors",
        compact ? "min-h-16 px-4 py-3" : "min-h-32 px-6 py-8",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/40",
      )}
      onClick={openFileDialog}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openFileDialog()
      }}
    >
      <CloudArrowUpIcon
        className={cn("text-muted-foreground", compact ? "size-5" : "size-8")}
      />
      <p className="text-sm font-medium">{NS.brochure.drop_title}</p>
      {!compact ? (
        <p className="text-muted-foreground text-xs">{NS.brochure.drop_hint}</p>
      ) : null}
    </div>
  )

  return (
    <section className="mt-12 space-y-4 border-t border-border/60 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium">
          {NS.section.brochures} ({formatEnDigits(fields.length)})
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <input {...getInputProps()} className="sr-only" />
          <Button
            type="button"
            onClick={openFileDialog}
            className="gap-1.5"
          >
            <CloudArrowUpIcon className="size-4" />
            {NS.action.add_multiple_files}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append(createEmptyAlbumBrochureRow())}
          >
            <PlusIcon className="size-4" />
            {NS.action.new_brochure}
          </Button>
        </div>
      </div>

      {fields.length === 0 ? (
        dropzone(false)
      ) : (
        <>
          {dropzone(true)}
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
                  <SoundAlbumBrochureRow
                    key={field.id}
                    id={field.id}
                    index={index}
                    onRemove={() => remove(index)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </>
      )}
    </section>
  )
}
