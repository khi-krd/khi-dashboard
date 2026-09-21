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
import { Bars2Icon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import {
  useFieldArray,
  useFormContext,
  type FieldValues,
  type Path,
} from "react-hook-form"

import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { Button } from "@/components/ui/button"
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
import { createEmptyGalleryItem } from "@/types/media-gallery"
import type { MediaKind } from "@/types/media-gallery"

const KIND_LABELS: Record<MediaKind, string> = {
  IMAGE: "وێنە",
  VIDEO: "ڤیدیۆ",
  AUDIO: "دەنگ",
}

type MediaGalleryEditorProps<T extends FieldValues> = {
  name: Path<T>
  title?: string
  addLabel?: string
  emptyLabel?: string
}

export function MediaGalleryEditor<T extends FieldValues>({
  name,
  title = "گالەری میدیا",
  addLabel = "زیادکردنی میدیا",
  emptyLabel = "هیچ میدیایەک زیاد نەکراوە",
}: MediaGalleryEditorProps<T>) {
  const { control, setValue, getValues } = useFormContext<T>()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: name as never,
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
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
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
  onRemove,
}: {
  fieldId: string
  index: number
  name: Path<T>
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
          <Label className="text-xs">ڕیزبندی</Label>
          <Input
            type="number"
            className="mt-1 h-9 font-mono"
            {...register(`${name}.${index}.sortOrder` as Path<T>, {
              valueAsNumber: true,
            })}
          />
        </div>
      </div>

      <MediaCoverUpload
        label="URL ی میدیا"
        previewUrl={url?.trim() || null}
        urlValue={url ?? ""}
        onUrlChange={(s) =>
          setValue(`${name}.${index}.url` as Path<T>, s as never, {
            shouldDirty: true,
          })
        }
        accept={
          kind === "VIDEO"
            ? "video/*"
            : kind === "AUDIO"
              ? "audio/*"
              : "image/jpeg,image/png,image/webp,image/gif"
        }
        aspectClass={
          kind === "AUDIO" ? "aspect-square max-w-[200px]" : "aspect-video"
        }
      />

      {kind === "VIDEO" || kind === "AUDIO" ? (
        <div>
          <Label className="text-xs">وێنەی بچووک (thumbnail)</Label>
          <Input
            className="mt-1 h-9 text-xs"
            dir="ltr"
            placeholder="https://…"
            {...register(`${name}.${index}.thumbnailUrl` as Path<T>)}
          />
        </div>
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
