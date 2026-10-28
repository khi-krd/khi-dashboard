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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Bars2Icon,
  CloudArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useCallback, useState } from "react"
import {
  useFieldArray,
  useFormContext,
  type FieldValues,
  type Path,
} from "react-hook-form"

import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { UploadProgressLine } from "@/components/shared/upload-progress-line"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useFileUpload } from "@/hooks/use-file-upload"
import { uploadMedia } from "@/services/mediaService"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  createEmptyGalleryItem,
  type MediaGalleryItemFormValues,
  type MediaKind,
} from "@/types/media-gallery"

const KIND_LABELS: Record<MediaKind, string> = {
  IMAGE: "وێنە",
  VIDEO: "ڤیدیۆ",
  AUDIO: "دەنگ",
}

const KIND_URL_LABELS: Record<MediaKind, string> = {
  IMAGE: "لینکی وێنە",
  VIDEO: "لینکی ڤیدیۆ",
  AUDIO: "لینکی دەنگ",
}

const KIND_VARIANT: Record<MediaKind, "image" | "video" | "audio"> = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
}

/** Source tabs for VIDEO/AUDIO rows — mirrors the sound-file sheet modes. */
type SourceMode = "file" | "external" | "embed"

const SOURCE_MODE_LABELS: Record<SourceMode, string> = {
  file: "فایل / لینک",
  external: "لینکی دەرەکی",
  embed: "ئێمبێد",
}

const EXTERNAL_PLACEHOLDERS: Record<MediaKind, string> = {
  IMAGE: "https://…",
  VIDEO: "https://youtube.com/watch?v=…",
  AUDIO: "https://soundcloud.com/artist/track",
}

const EMBED_PLACEHOLDERS: Record<MediaKind, string> = {
  IMAGE: "https://…",
  VIDEO: 'https://youtube.com/embed/… یان کۆدی <iframe>',
  AUDIO: 'https://w.soundcloud.com/player/… یان کۆدی <iframe>',
}

const MEDIA_EXT = {
  VIDEO: /\.(mp4|webm|mov|m4v|ogv|ogg|mkv|avi)$/i,
  AUDIO: /\.(mp3|wav|ogg|oga|m4a|aac|flac|opus|weba)$/i,
} as const

function kindFromFile(file: File): MediaKind {
  if (file.type.startsWith("video/") || MEDIA_EXT.VIDEO.test(file.name)) {
    return "VIDEO"
  }
  if (file.type.startsWith("audio/") || MEDIA_EXT.AUDIO.test(file.name)) {
    return "AUDIO"
  }
  return "IMAGE"
}

type MediaGalleryEditorProps<T extends FieldValues> = {
  name: Path<T>
  title?: string
  addLabel?: string
  emptyLabel?: string
  /** Owning entity for the R2 folder layout ("news" → news/images/…). */
  entity?: string
}

export function MediaGalleryEditor<T extends FieldValues>({
  name,
  title = "گالەری میدیا",
  addLabel = "زیادکردنی میدیا",
  emptyLabel = "هیچ میدیایەک زیاد نەکراوە",
  entity,
}: MediaGalleryEditorProps<T>) {
  const { control, setValue, getValues } = useFormContext<T>()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: name as never,
  })

  const [busyCount, setBusyCount] = useState(0)
  const [progress, setProgress] = useState<number | null>(null)

  // Multi-file upload: every picked/dropped file uploads to the entity's
  // folder and becomes its own gallery row (kind follows the MIME type).
  const addFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return
      setBusyCount(files.length)
      setProgress(0)
      const share = 100 / files.length
      const base = (getValues(name) as unknown[] | undefined)?.length ?? 0
      const added: MediaGalleryItemFormValues[] = []
      for (const [i, file] of files.entries()) {
        try {
          const res = await uploadMedia(
            file,
            entity ?? "content",
            (pct) => setProgress(i * share + (pct / 100) * share),
          )
          added.push({
            ...createEmptyGalleryItem(base + added.length),
            kind: kindFromFile(file),
            url: res.fileUrl,
          })
        } catch {
          // skip failed uploads; the row just isn't created
        }
      }
      added.forEach((item) => append(item as never))
      setBusyCount(0)
      setProgress(null)
    },
    [append, entity, getValues, name],
  )

  const [
    { isDragging },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
      clearFiles,
    },
  ] = useFileUpload({
    maxFiles: 30,
    accept: "image/*,video/*,audio/*",
    multiple: true,
    onFilesAdded: (added) => {
      const files = added
        .map((entry) => entry.file)
        .filter((file): file is File => file instanceof File)
      void addFiles(files)
      queueMicrotask(() => clearFiles())
    },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    move(oldIndex, newIndex)
    // The backend stores this gallery as JSONB and orders by each item's
    // sortOrder — after a move, position is the truth, so renumber them all.
    const reordered = getValues(name) as { sortOrder?: number }[] | undefined
    reordered?.forEach((_, i) =>
      setValue(`${name}.${i}.sortOrder` as Path<T>, i as never, {
        shouldDirty: true,
      }),
    )
  }

  return (
    <section
      className={cn(
        "space-y-3 rounded-lg transition-colors",
        isDragging && "bg-primary/5 ring-primary/30 ring-2 ring-offset-2",
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input {...getInputProps({ disabled: busyCount > 0 })} className="sr-only" />
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            disabled={busyCount > 0}
            onClick={openFileDialog}
          >
            <CloudArrowUpIcon className="size-3.5" />
            بارکردنی فایلەکان
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={() =>
              append(createEmptyGalleryItem(fields.length) as never)
            }
          >
            <PlusIcon className="size-3.5" />
            {addLabel}
          </Button>
        </div>
      </div>

      {busyCount > 0 ? (
        <div className="border-border bg-muted/10 flex items-center gap-3 rounded-lg border border-dashed p-3">
          <Spinner className="size-4" />
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs">
              {busyCount} فایل بار دەکرێت…
            </p>
            <UploadProgressLine value={progress} className="mt-1.5" />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFileDialog}
          className={cn(
            "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground flex w-full items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-xs transition-colors",
            isDragging && "border-primary text-primary",
          )}
        >
          <CloudArrowUpIcon className="size-4" />
          فایلەکان ئێرە دابنێ یان کلیک بکە — وێنە، ڤیدیۆ و دەنگ پێکەوە
        </button>
      )}

      {fields.length === 0 ? (
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
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
            <div className="space-y-4">
              {fields.map((field, index) => (
                <SortableGalleryRow
                  key={field.id}
                  fieldId={field.id}
                  index={index}
                  name={name}
                  entity={entity}
                  onRemove={() => remove(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  )
}

function SortableGalleryRow<T extends FieldValues>({
  fieldId,
  index,
  name,
  entity,
  onRemove,
}: {
  fieldId: string
  index: number
  name: Path<T>
  entity?: string
  onRemove: () => void
}) {
  const { register, setValue, watch } = useFormContext<T>()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fieldId })

  const kind = watch(`${name}.${index}.kind` as Path<T>) as MediaKind
  const url = watch(`${name}.${index}.url` as Path<T>) as string
  const embedUrl = watch(`${name}.${index}.embedUrl` as Path<T>) as string
  const externalUrl = watch(
    `${name}.${index}.externalUrl` as Path<T>,
  ) as string
  const thumbnailUrl = watch(
    `${name}.${index}.thumbnailUrl` as Path<T>,
  ) as string

  // Which source tab is shown for VIDEO/AUDIO rows — seeded from whichever
  // field already holds a value; all three stay in the form so switching
  // tabs never loses typed data.
  const [sourceMode, setSourceMode] = useState<SourceMode>(() =>
    embedUrl?.trim() ? "embed" : externalUrl?.trim() ? "external" : "file",
  )

  const isMedia = kind === "VIDEO" || kind === "AUDIO"

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "border-border bg-muted/10 space-y-3 rounded-lg border p-4",
        isDragging && "z-10 shadow-lg ring-2 ring-primary/20",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="ڕایکێشە بۆ گۆڕینی ڕیز"
            className="text-muted-foreground hover:text-foreground cursor-grab touch-none rounded-md p-1 transition-colors active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <Bars2Icon className="size-4" aria-hidden />
          </button>
          <span className="text-muted-foreground text-xs font-medium">
            #{index + 1}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive size-8"
          onClick={onRemove}
          aria-label="سڕینەوە"
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label className="text-xs">جۆر</Label>
          <Select
            value={kind ?? "IMAGE"}
            onValueChange={(v) =>
              setValue(`${name}.${index}.kind` as Path<T>, v as never, {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger className="mt-1 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(KIND_LABELS) as MediaKind[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {KIND_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Sort Order</Label>
          <Input
            type="number"
            className="mt-1 h-9 font-mono"
            {...register(`${name}.${index}.sortOrder` as Path<T>, {
              valueAsNumber: true,
            })}
          />
        </div>
      </div>

      {isMedia ? (
        <div className="space-y-2">
          {/* Source picker — file/URL · external page link · embed */}
          <div className="bg-muted/40 inline-flex rounded-md p-0.5">
            {(Object.keys(SOURCE_MODE_LABELS) as SourceMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSourceMode(m)}
                className={cn(
                  "rounded px-3 py-1 text-xs transition-colors",
                  sourceMode === m
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {SOURCE_MODE_LABELS[m]}
              </button>
            ))}
          </div>

          {sourceMode === "file" ? (
            <MediaCoverUpload
              label={KIND_URL_LABELS[kind ?? "IMAGE"]}
              previewUrl={url?.trim() || null}
              urlValue={url ?? ""}
              entity={entity}
              onUrlChange={(s) =>
                setValue(`${name}.${index}.url` as Path<T>, s as never, {
                  shouldDirty: true,
                })
              }
              variant={KIND_VARIANT[kind ?? "IMAGE"]}
              accept={kind === "VIDEO" ? "video/*" : "audio/*"}
              aspectClass={
                kind === "AUDIO" ? "aspect-square max-w-[200px]" : "aspect-video"
              }
            />
          ) : sourceMode === "external" ? (
            <div>
              <Label className="text-xs">لینکی دەرەکی</Label>
              <Input
                className="mt-1 h-9 font-mono text-xs"
                dir="ltr"
                placeholder={EXTERNAL_PLACEHOLDERS[kind]}
                {...register(`${name}.${index}.externalUrl` as Path<T>)}
              />
              <p className="text-muted-foreground mt-1 text-[11px]">
                لینکی لاپەڕەی سەرچاوە — وەک SoundCloud یان YouTube.
              </p>
            </div>
          ) : (
            <div>
              <Label className="text-xs">Embed URL یان کۆدی iframe</Label>
              <Input
                className="mt-1 h-9 font-mono text-xs"
                dir="ltr"
                placeholder={EMBED_PLACEHOLDERS[kind]}
                {...register(`${name}.${index}.embedUrl` as Path<T>)}
              />
              <p className="text-muted-foreground mt-1 text-[11px]">
                لینکی پلەیەر/ئێمبێد یان کۆدی iframeی تەواو — لە ماڵپەڕ وەک
                پلەیەر نمایش دەکرێت.
              </p>
            </div>
          )}
        </div>
      ) : (
        <MediaCoverUpload
          label={KIND_URL_LABELS[kind ?? "IMAGE"]}
          previewUrl={url?.trim() || null}
          urlValue={url ?? ""}
          entity={entity}
          onUrlChange={(s) =>
            setValue(`${name}.${index}.url` as Path<T>, s as never, {
              shouldDirty: true,
            })
          }
          variant={KIND_VARIANT[kind ?? "IMAGE"]}
          accept="image/jpeg,image/png,image/webp,image/gif"
          aspectClass="aspect-video"
        />
      )}

      {isMedia ? (
        <MediaCoverUpload
          entity={entity}
          label="وێنەی بچووک (thumbnail)"
          variant="image"
          aspectClass="aspect-video max-w-[280px]"
          previewUrl={thumbnailUrl?.trim() || null}
          urlValue={thumbnailUrl ?? ""}
          onUrlChange={(s) =>
            setValue(`${name}.${index}.thumbnailUrl` as Path<T>, s as never, {
              shouldDirty: true,
            })
          }
        />
      ) : null}

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Input
          placeholder="سەردێڕی سۆرانی"
          {...register(`${name}.${index}.captionCkb` as Path<T>)}
        />
        <Input
          placeholder="سەردێڕی کورمانجی"
          {...register(`${name}.${index}.captionKmr` as Path<T>)}
        />
      </div>
    </div>
  )
}
