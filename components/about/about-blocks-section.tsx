"use client"

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentDuplicateIcon,
  Squares2X2Icon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useFieldArray, useFormContext } from "react-hook-form"

import {
  BLOCK_TYPES,
  BLOCK_TYPE_VARIANTS,
  BlockTypePill,
} from "@/components/about/block-type-pill"
import { CollectionTiptapEditor } from "@/components/image-collections/collection-tiptap-editor"
import { NS } from "@/components/about/about-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  createEmptyBlock,
  type AboutFormValues,
} from "@/lib/validations/about"
import { cn } from "@/lib/utils"
import type { AboutBlockType } from "@/types/about"

function BlockTypeFields({
  index,
  type,
  activeLang,
}: {
  index: number
  type: AboutBlockType
  activeLang: "CKB" | "KMR"
}) {
  const { register, watch, setValue } = useFormContext<AboutFormValues>()

  if (type === "TEXT") {
    const body =
      activeLang === "CKB"
        ? watch(`blocks.${index}.bodyCkb`)
        : watch(`blocks.${index}.bodyKmr`)
    return (
      <div className="space-y-3">
        <Input
          {...register(
            activeLang === "CKB"
              ? `blocks.${index}.headingCkb`
              : `blocks.${index}.headingKmr`,
          )}
          placeholder="سەرناونیشان…"
          className="h-9"
        />
        <CollectionTiptapEditor
          lang={activeLang}
          value={body ?? ""}
          onChange={(html) =>
            setValue(
              activeLang === "CKB"
                ? `blocks.${index}.bodyCkb`
                : `blocks.${index}.bodyKmr`,
              html,
              { shouldDirty: true, shouldValidate: true },
            )
          }
        />
      </div>
    )
  }

  if (type === "IMAGE") {
    return (
      <div className="space-y-3">
        <Input {...register(`blocks.${index}.imageUrl`)} placeholder="https://…" />
        <Input
          {...register(
            activeLang === "CKB"
              ? `blocks.${index}.captionCkb`
              : `blocks.${index}.captionKmr`,
          )}
          placeholder="ژێرنووس…"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) setValue(`blocks.${index}.imageFile`, f, { shouldDirty: true })
          }}
        />
      </div>
    )
  }

  if (type === "VIDEO") {
    return (
      <div className="space-y-3">
        <Input {...register(`blocks.${index}.embedUrl`)} placeholder="لینکی ڤیدیۆ…" />
        <Input
          {...register(
            activeLang === "CKB"
              ? `blocks.${index}.captionCkb`
              : `blocks.${index}.captionKmr`,
          )}
          placeholder="ژێرنووس…"
        />
      </div>
    )
  }

  if (type === "AUDIO") {
    return (
      <div className="space-y-3">
        <Input
          {...register(
            activeLang === "CKB" ? `blocks.${index}.titleCkb` : `blocks.${index}.titleKmr`,
          )}
          placeholder="ناونیشان…"
        />
        <Input {...register(`blocks.${index}.audioUrl`)} placeholder="لینکی دەنگ…" />
        <Input
          type="number"
          {...register(`blocks.${index}.durationSeconds`, { valueAsNumber: true })}
          placeholder="ماوە (چرکە)"
        />
      </div>
    )
  }

  if (type === "GALLERY") {
    return (
      <div className="space-y-2">
        <Label className="text-xs">وێنەکان (URL، هەر دێڕێک یەک)</Label>
        <textarea
          className="border-border min-h-[80px] w-full rounded-md border p-2 text-sm"
          value={
            (watch(`blocks.${index}.images`) as { imageUrl?: string }[] | undefined)
              ?.map((i) => i.imageUrl ?? "")
              .filter(Boolean)
              .join("\n") ?? ""
          }
          onChange={(e) => {
            const urls = e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
            setValue(
              `blocks.${index}.images`,
              urls.map((imageUrl, i) => ({ imageUrl, sortOrder: i })),
              { shouldDirty: true },
            )
          }}
        />
      </div>
    )
  }

  if (type === "QUOTE") {
    return (
      <div className="space-y-3">
        <textarea
          className="border-border min-h-[80px] w-full rounded-md border p-2 text-sm"
          {...register(
            activeLang === "CKB" ? `blocks.${index}.textCkb` : `blocks.${index}.textKmr`,
          )}
        />
        <Input
          {...register(
            activeLang === "CKB"
              ? `blocks.${index}.attributionCkb`
              : `blocks.${index}.attributionKmr`,
          )}
          placeholder="سەرچاوە…"
        />
      </div>
    )
  }

  if (type === "STAT") {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <Input {...register(`blocks.${index}.value`)} placeholder="ژمارە" />
        <Input
          {...register(
            activeLang === "CKB" ? `blocks.${index}.unitCkb` : `blocks.${index}.unitKmr`,
          )}
          placeholder="یەکە"
        />
        <Input
          {...register(
            activeLang === "CKB" ? `blocks.${index}.labelCkb` : `blocks.${index}.labelKmr`,
          )}
          placeholder="ناونیشان"
        />
      </div>
    )
  }

  return null
}

function SortableBlockCard({
  id,
  index,
  activeLang,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
}: {
  id: string
  index: number
  activeLang: "CKB" | "KMR"
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onRemove: () => void
}) {
  const { watch } = useFormContext<AboutFormValues>()
  const block = watch(`blocks.${index}`)
  const type = block?.type ?? "TEXT"
  const variant = BLOCK_TYPE_VARIANTS[type]

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "border-border bg-card overflow-hidden rounded-xl border transition-shadow",
        isDragging && "shadow-lg ring-2 ring-primary/20",
      )}
    >
      <header className="border-border/60 bg-muted/20 group flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="text-muted-foreground/60 hover:text-foreground cursor-grab p-0.5 transition-colors"
            aria-label="reorder"
          >
            <Bars3Icon className="size-3.5" />
          </button>
          <span className="text-muted-foreground/70 font-mono text-[10px] tracking-wider">
            {String(index + 1).padStart(2, "0")}
          </span>
          <BlockTypePill type={type} />
        </div>
        <div className="flex items-center gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={onMoveUp}>
            <ChevronUpIcon className="size-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={onMoveDown}>
            <ChevronDownIcon className="size-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={onDuplicate}>
            <DocumentDuplicateIcon className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive size-7"
            onClick={onRemove}
          >
            <TrashIcon className="size-3.5" />
          </Button>
        </div>
      </header>
      <div className="p-4">
        <BlockTypeFields index={index} type={type} activeLang={activeLang} />
      </div>
    </article>
  )
}

function BlockTypePicker({
  onPick,
  compact,
}: {
  onPick: (t: AboutBlockType) => void
  compact?: boolean
}) {
  if (compact) {
    return (
      <div className="grid grid-cols-7 gap-1.5">
        {BLOCK_TYPES.map((type) => {
          const variant = BLOCK_TYPE_VARIANTS[type]
          const Icon = variant.icon
          return (
            <button
              key={type}
              type="button"
              onClick={() => onPick(type)}
              className="border-border bg-background hover:bg-muted/40 hover:border-foreground/30 group flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 transition-colors"
              title={variant.label}
            >
              <Icon className="size-3.5 transition-transform group-hover:scale-110" />
              <span className="hidden text-xs md:inline">{variant.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
      {BLOCK_TYPES.map((type) => {
        const variant = BLOCK_TYPE_VARIANTS[type]
        const Icon = variant.icon
        return (
          <button
            key={type}
            type="button"
            onClick={() => onPick(type)}
            className="border-border bg-background hover:bg-muted/40 hover:border-foreground/30 group flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-lg border transition-transform group-hover:scale-110",
                variant.tint,
              )}
            >
              <Icon className="size-4" />
            </div>
            <span className="text-xs font-medium">{variant.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function AboutBlocksSection({
  activeLang,
}: {
  activeLang: "CKB" | "KMR"
}) {
  const { control } = useFormContext<AboutFormValues>()
  const { fields, append, remove, move, insert } = useFieldArray({
    control,
    name: "blocks",
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const ids = fields.map((f) => String(f.id))

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex >= 0 && newIndex >= 0) move(oldIndex, newIndex)
  }

  function addBlock(type: AboutBlockType) {
    append(createEmptyBlock(type, fields.length))
  }

  return (
    <section className="border-border/60 mt-12 border-t pt-6">
      <header className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-medium">
          {NS.form.blocks}
          {fields.length > 0 ? (
            <span className="text-muted-foreground ms-2 font-mono text-xs">
              {fields.length}
            </span>
          ) : null}
        </h3>
      </header>

      {fields.length === 0 ? (
        <div className="border-border bg-muted/10 rounded-2xl border-2 border-dashed p-8 md:p-10">
          <div className="mb-6 flex flex-col items-center justify-center text-center">
            <div className="bg-muted/60 mb-3 flex size-14 items-center justify-center rounded-2xl">
              <Squares2X2Icon className="text-muted-foreground/50 size-7" />
            </div>
            <p className="text-base font-medium">{NS.form.blocks_empty_title}</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              {NS.form.blocks_empty_desc}
            </p>
          </div>
          <BlockTypePicker onPick={addBlock} />
        </div>
      ) : (
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <SortableBlockCard
                    key={field.id}
                    id={String(field.id)}
                    index={index}
                    activeLang={activeLang}
                    onMoveUp={() => index > 0 && move(index, index - 1)}
                    onMoveDown={() =>
                      index < fields.length - 1 && move(index, index + 1)
                    }
                    onDuplicate={() => {
                      const b = createEmptyBlock(
                        field.type as AboutBlockType,
                        fields.length,
                      )
                      insert(index + 1, { ...field, ...b, id: `dup-${Date.now()}` })
                    }}
                    onRemove={() => remove(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="border-border bg-muted/10 rounded-xl border border-dashed p-3">
            <p className="text-muted-foreground mb-2 px-1 text-xs">{NS.form.add_block}</p>
            <BlockTypePicker onPick={addBlock} compact />
          </div>
        </div>
      )}
    </section>
  )
}

