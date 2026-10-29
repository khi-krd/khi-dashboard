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
import { useEffect, useMemo, useRef, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { AlbumItemSheet } from "@/components/image-collections/album-item-sheet"
import { NS } from "@/components/image-collections/collections-strings"
import {
  CompressionBatchStrip,
  CompressionCompareCard,
} from "@/components/shared/compression-compare"
import { CompressionToggle } from "@/components/shared/compression-toggle"
import { COMPRESS_NS } from "@/components/shared/compress-strings"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import {
  isUploadable,
  stagedUploadFile,
  useImageCompression,
} from "@/hooks/use-image-compression"
import { formatCkbDigits, formatEnDigits } from "@/lib/intl-ckb"
import {
  compressionSettingsToOptions,
  DEFAULT_COMPRESSION_SETTINGS,
  type CompressionSettings,
} from "@/lib/image-compression"
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
  const stagedUrl = useMemo(() => {
    if (!item.stagedBinary) return null
    return URL.createObjectURL(item.stagedBinary)
  }, [item.stagedBinary])

  useEffect(() => {
    if (!stagedUrl) return
    return () => URL.revokeObjectURL(stagedUrl)
  }, [stagedUrl])

  return stagedUrl ?? albumItemSrc(item) ?? null
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
  const [settings, setSettings] = useState<CompressionSettings>(
    DEFAULT_COMPRESSION_SETTINGS,
  )
  const compression = useImageCompression(
    compressionSettingsToOptions(settings),
  )
  const [ingesting, setIngesting] = useState(false)

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

  function stageFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    compression.addFiles(Array.from(fileList), settings.enabled)
  }

  const uploadable = compression.items.filter(isUploadable)
  const canIngest =
    uploadable.length > 0 && !compression.isCompressing && !ingesting

  // "بارکردنی هەموو" for the album: the file rides the collection's multipart
  // PUT, so ingesting means appending the compressed File as `stagedBinary`.
  async function ingestAll() {
    const ready = compression.items.filter(isUploadable)
    if (ready.length === 0) return
    setIngesting(true)
    const staged = new Set(
      fields
        .map((f) => f.stagedBinary)
        .filter((f): f is File => !!f)
        .map((f) => `${f.name}:${f.size}:${f.lastModified}`),
    )
    const toAppend: Parameters<typeof append>[0][] = []
    for (const item of ready) {
      compression.updateItem(item.id, { uploadStatus: "uploading" })
      try {
        const file = stagedUploadFile(item)
        const key = `${file.name}:${file.size}:${file.lastModified}`
        if (staged.has(key)) {
          compression.updateItem(item.id, { uploadStatus: "done" })
          continue
        }
        staged.add(key)
        const meta = await applyImageFileMeta(file)
        toAppend.push({
          ...createEmptyAlbumItem(fields.length + toAppend.length),
          stagedBinary: file,
          ...meta,
        })
        compression.updateItem(item.id, { uploadStatus: "done" })
      } catch {
        compression.updateItem(item.id, { uploadStatus: "error" })
      }
    }
    for (const item of toAppend) append(item)
    setIngesting(false)
    compression.removeFinished()
  }

  const sheetItem = sheetIdx != null ? watch(`imageAlbum.${sheetIdx}`) : null

  return (
    <section className="mt-12 space-y-4 border-t border-border/60 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium">
          {NS.section.gallery} ({formatCkbDigits(fields.length)})
        </h2>
        {/* Always visible — a URL-only item can only be created through
            "new image" → sheet, even when the gallery is empty. */}
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
      </div>

      <input
        ref={bulkRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(e) => {
          stageFiles(e.target.files)
          e.target.value = ""
        }}
      />

      <CompressionToggle
        value={settings}
        onChange={setSettings}
        disabled={ingesting}
      />

      {compression.items.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {compression.items.map((item) => (
              <CompressionCompareCard
                key={item.id}
                item={item}
                onRemove={
                  ingesting ? undefined : () => compression.remove(item.id)
                }
                onRetry={
                  item.status === "error" && !ingesting
                    ? () => compression.requeue(item.id)
                    : undefined
                }
              />
            ))}
          </div>
          <CompressionBatchStrip stats={compression.stats} />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!canIngest}
              onClick={() => void ingestAll()}
            >
              {COMPRESS_NS.batch.addToAlbum}
              {uploadable.length > 0
                ? ` (${formatEnDigits(uploadable.length)})`
                : ""}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={ingesting}
              onClick={() => compression.clear()}
            >
              {NS.action.cancel}
            </Button>
          </div>
        </div>
      ) : null}

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
