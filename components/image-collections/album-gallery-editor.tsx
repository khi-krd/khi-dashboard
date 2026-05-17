"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Bars2Icon,
  CloudArrowUpIcon,
  PencilSquareIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useRef, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { AlbumItemSheet } from "@/components/image-collections/album-item-sheet"
import { NS } from "@/components/image-collections/collections-strings"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { albumItemSrc, applyImageFileMeta } from "@/lib/image-album-utils"
import {
  createEmptyAlbumItem,
  type CollectionFormValues,
  type ImageItemFormValues,
} from "@/lib/validations/image-collections"

function albumItemHasSource(item: ImageItemFormValues): boolean {
  return !!(
    item.stagedBinary ||
    item.imageUrl?.trim() ||
    item.externalUrl?.trim() ||
    item.embedUrl?.trim()
  )
}

function useItemPreview(item: ImageItemFormValues) {
  const [blob, setBlob] = useState<string | null>(null)
  useEffect(() => {
    if (!item.stagedBinary) {
      setBlob(null)
      return
    }
    const u = URL.createObjectURL(item.stagedBinary)
    setBlob(u)
    return () => URL.revokeObjectURL(u)
  }, [item.stagedBinary])
  return blob ?? albumItemSrc(item) ?? null
}

function SortableGalleryTile({
  id,
  index,
  item,
  onEdit,
  onRemove,
}: {
  id: string
  index: number
  item: ImageItemFormValues
  onEdit: () => void
  onRemove: () => void
}) {
  const preview = useItemPreview(item)
  const hasSource = albumItemHasSource(item)
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const caption = item.captionCkb?.trim() || item.captionKmr?.trim() || NS.item.no_caption

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-border group relative aspect-square overflow-hidden rounded-lg border"
    >
      <button type="button" className="relative block size-full" onClick={onEdit}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-full object-cover" />
        ) : hasSource ? (
          <span className="text-muted-foreground flex size-full items-center justify-center text-xs">
            {NS.item.no_source}
          </span>
        ) : (
          <span className="flex size-full items-center justify-center bg-amber-500/10 px-2 text-center text-xs text-amber-800 dark:text-amber-200">
            {NS.item.no_source}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-6 text-start">
          <p className="truncate text-[10px] font-medium text-white">
            #{formatCkbDigits(index + 1)} {caption}
          </p>
        </div>
      </button>
      <div className="absolute end-1 top-1 flex gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100">
        <button
          type="button"
          className="bg-background/90 rounded p-1 shadow"
          onClick={onEdit}
        >
          <PencilSquareIcon className="size-3.5" />
        </button>
        <button
          type="button"
          className="text-destructive hover:bg-destructive/10 rounded p-1"
          onClick={onRemove}
        >
          <TrashIcon className="size-3.5" />
        </button>
        <button
          type="button"
          className="bg-background/90 cursor-grab rounded p-1 shadow"
          {...attributes}
          {...listeners}
        >
          <Bars2Icon className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

export function AlbumGalleryEditor({ showKmrFields }: { showKmrFields?: boolean }) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<CollectionFormValues>()
  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: "imageAlbum",
  })
  const [sheetIdx, setSheetIdx] = useState<number | null>(null)
  const bulkRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const items = fields.map((f) => f.id)
  const albumErrors = errors.imageAlbum

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    const oldIdx = fields.findIndex((f) => f.id === e.active.id)
    const newIdx = fields.findIndex((f) => f.id === e.over!.id)
    if (oldIdx < 0 || newIdx < 0) return
    move(oldIdx, newIdx)
  }

  async function ingestFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    for (const file of Array.from(fileList)) {
      const meta = await applyImageFileMeta(file)
      append({
        ...createEmptyAlbumItem(fields.length),
        stagedBinary: file,
        ...meta,
      })
    }
  }

  const sheetItem = sheetIdx != null ? watch(`imageAlbum.${sheetIdx}`) : null

  return (
    <section className="mt-12 space-y-4 border-t border-border/60 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium">
          {NS.section.gallery} ({formatCkbDigits(fields.length)})
        </h2>
        {fields.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => bulkRef.current?.click()}
            >
              <CloudArrowUpIcon className="size-4" />
              {NS.action.upload_files}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                append(createEmptyAlbumItem(fields.length))
                setSheetIdx(fields.length)
              }}
            >
              <PlusIcon className="size-4" />
              {NS.action.new_image}
            </Button>
          </div>
        ) : null}
      </div>

      <input
        ref={bulkRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(e) => {
          void ingestFiles(e.target.files)
          e.target.value = ""
        }}
      />

      {fields.length === 0 ? (
        <div className="border-muted-foreground/35 flex w-full flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
          <PhotoIcon className="text-muted-foreground size-12 opacity-50" aria-hidden />
          <div>
            <p className="text-sm font-medium">{NS.gallery.empty_title}</p>
            <p className="text-muted-foreground mt-1 text-xs">{NS.gallery.empty_subtitle}</p>
          </div>
          <Button type="button" onClick={() => bulkRef.current?.click()}>
            <CloudArrowUpIcon className="size-4" />
            {NS.action.upload_files}
          </Button>
        </div>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          sensors={sensors}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={items} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {fields.map((field, idx) => (
                <SortableGalleryTile
                  key={field.id}
                  id={field.id}
                  index={idx}
                  item={watch(`imageAlbum.${idx}`)}
                  onEdit={() => setSheetIdx(idx)}
                  onRemove={() => {
                    remove(idx)
                    if (sheetIdx === idx) setSheetIdx(null)
                  }}
                />
              ))}
              <button
                type="button"
                onClick={() => bulkRef.current?.click()}
                className="border-muted-foreground/40 text-muted-foreground hover:border-primary/50 flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-xs"
              >
                <PlusIcon className="size-8 opacity-50" />
                {NS.action.add_gallery_image}
              </button>
            </div>
          </SortableContext>
        </DndContext>
      )}

      <FieldError>
        {typeof albumErrors?.message === "string" ? albumErrors.message : undefined}
      </FieldError>

      <AlbumItemSheet
        open={sheetIdx != null}
        onOpenChange={(o) => !o && setSheetIdx(null)}
        index={sheetIdx ?? 0}
        item={sheetItem}
        showKmrFields={showKmrFields}
        onSave={(saved) => {
          if (sheetIdx == null) return
          update(sheetIdx, saved)
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
