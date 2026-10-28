"use client"

import { PencilSquareIcon } from "@heroicons/react/24/outline"
import { useMemo, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { AlbumItemSheet } from "@/components/image-collections/album-item-sheet"
import { CollectionItemSourcePanel } from "@/components/image-collections/collection-item-source-panel"
import { NS } from "@/components/image-collections/collections-strings"
import { FieldError } from "@/components/ui/field"
import { applyImageFileMeta } from "@/lib/image-album-utils"
import {
  createEmptyAlbumItem,
  type CollectionFormValues,
  type ImageItemFormValues,
} from "@/lib/validations/image-collections"

export function AlbumSingleEditor({ showKmrFields }: { showKmrFields?: boolean }) {
  const {
    control,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext<CollectionFormValues>()
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "imageAlbum",
  })
  const [sheetOpen, setSheetOpen] = useState(false)

  const item = fields.length > 0 ? watch("imageAlbum.0") : undefined
  const albumErrors = errors.imageAlbum

  const hasSource = useMemo(() => {
    if (!item) return false
    return !!(
      item.stagedBinary ||
      item.imageUrl?.trim() ||
      item.externalUrl?.trim() ||
      item.embedUrl?.trim()
    )
  }, [item])

  async function ingestSource(p: Partial<ImageItemFormValues>) {
    const meta = p.stagedBinary ? await applyImageFileMeta(p.stagedBinary) : {}
    const current = getValues("imageAlbum.0")
    if (current) {
      // Merge into the existing item — id, captions and metadata survive.
      update(0, { ...createEmptyAlbumItem(0), ...current, ...p, ...meta })
    } else {
      append({ ...createEmptyAlbumItem(0), ...p, ...meta })
    }
  }

  return (
    <section className="mt-12 space-y-4 border-t border-border/60 pt-6">
      <h2 className="text-sm font-medium">{NS.section.album}</h2>
      {/* The panel stays mounted while a source exists so the URL input
          keeps typing — unmounting mid-keystroke lost focus and the rest
          of the URL. */}
      <CollectionItemSourcePanel
        item={item ?? createEmptyAlbumItem(0)}
        onChange={(p) => {
          void ingestSource(p)
        }}
        sourceError={
          albumErrors?.[0]?.imageUrl?.message as string | undefined
        }
      />
      {hasSource ? (
        <div className="border-border flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <p className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
            {item?.captionCkb?.trim() || NS.item.no_caption}
          </p>
          <button
            type="button"
            className="bg-background inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm"
            onClick={() => setSheetOpen(true)}
          >
            <PencilSquareIcon className="size-4" />
            {NS.action.edit}
          </button>
        </div>
      ) : null}
      <FieldError>
        {typeof albumErrors?.message === "string" ? albumErrors.message : undefined}
      </FieldError>

      <AlbumItemSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        index={0}
        item={item ?? null}
        showKmrFields={showKmrFields}
        onSave={(saved) => update(0, saved)}
        onDelete={() => {
          remove(0)
          setSheetOpen(false)
        }}
      />
    </section>
  )
}
