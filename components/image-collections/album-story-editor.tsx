"use client"

import {
  Bars2Icon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { AlbumItemSheet } from "@/components/image-collections/album-item-sheet"
import { NS } from "@/components/image-collections/collections-strings"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { albumItemSrc } from "@/lib/image-album-utils"
import {
  createEmptyAlbumItem,
  type CollectionFormValues,
  type ImageItemFormValues,
} from "@/lib/validations/image-collections"

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

export function AlbumStoryEditor({ showKmrFields }: { showKmrFields?: boolean }) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<CollectionFormValues>()
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "imageAlbum",
  })
  const [sheetIdx, setSheetIdx] = useState<number | null>(null)
  const albumErrors = errors.imageAlbum

  const sheetItem = sheetIdx != null ? watch(`imageAlbum.${sheetIdx}`) : null

  return (
    <section className="mt-12 space-y-4 border-t border-border/60 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium">
          {NS.section.story} ({formatCkbDigits(fields.length)})
        </h2>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            append(createEmptyAlbumItem(fields.length))
            setSheetIdx(fields.length)
          }}
        >
          <PlusIcon className="size-4" />
          {fields.length === 0 ? NS.action.first_step : NS.action.new_step}
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed py-12 text-center text-sm">
          {NS.story.empty}
        </p>
      ) : (
        <ol className="space-y-4">
          {fields.map((field, idx) => (
            <StoryEditorCard
              key={field.id}
              index={idx}
              total={fields.length}
              item={watch(`imageAlbum.${idx}`)}
              onEdit={() => setSheetIdx(idx)}
              onRemove={() => {
                remove(idx)
                if (sheetIdx === idx) setSheetIdx(null)
              }}
            />
          ))}
        </ol>
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

function StoryEditorCard({
  index,
  total,
  item,
  onEdit,
  onRemove,
}: {
  index: number
  total: number
  item: ImageItemFormValues
  onEdit: () => void
  onRemove: () => void
}) {
  const preview = useItemPreview(item)
  const stepLabel = NS.step.label(
    formatCkbDigits(index + 1),
    formatCkbDigits(total),
  )

  return (
    <li className="border-border flex gap-4 rounded-xl border p-4">
      <div className="bg-muted relative size-24 shrink-0 overflow-hidden rounded-lg">
        {preview ? (
          <Image
            src={preview}
            alt=""
            fill
            className="object-cover"
            unoptimized={preview.startsWith("blob:") || preview.startsWith("http")}
          />
        ) : (
          <span className="text-muted-foreground flex size-full items-center justify-center text-[10px]">
            {NS.item.no_source}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground mb-1 text-xs font-medium">{stepLabel}</p>
        <p className="truncate text-sm font-medium">
          {item.captionCkb?.trim() || NS.item.no_caption}
        </p>
        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
          {item.descriptionCkb?.replace(/<[^>]*>/g, " ").trim() || NS.dash}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <button type="button" className="rounded p-1 hover:bg-muted" onClick={onEdit}>
          <PencilSquareIcon className="size-4" />
        </button>
        <button
          type="button"
          className="text-destructive rounded p-1 hover:bg-destructive/10"
          onClick={onRemove}
        >
          <TrashIcon className="size-4" />
        </button>
        <span className="text-muted-foreground cursor-grab p-1">
          <Bars2Icon className="size-4" />
        </span>
      </div>
    </li>
  )
}
