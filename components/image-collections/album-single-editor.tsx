"use client"

import { PencilSquareIcon } from "@heroicons/react/24/outline"
import { useEffect, useMemo, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { AlbumItemSheet } from "@/components/image-collections/album-item-sheet"
import { CollectionItemSourcePanel } from "@/components/image-collections/collection-item-source-panel"
import { NS } from "@/components/image-collections/collections-strings"
import { FieldError } from "@/components/ui/field"
import { useObjectUrl } from "@/hooks/use-object-url"
import { applyImageFileMeta, albumItemSrc } from "@/lib/image-album-utils"
import {
  createEmptyAlbumItem,
  type CollectionFormValues,
  type ImageItemFormValues,
} from "@/lib/validations/image-collections"

function useItemPreview(item: ImageItemFormValues | undefined) {
  const blob = useObjectUrl(item?.stagedBinary)
  return blob ?? albumItemSrc(item ?? { imageUrl: "" }) ?? null
}

export function AlbumSingleEditor({ showKmrFields }: { showKmrFields?: boolean }) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<CollectionFormValues>()
  const { fields, replace, update, remove } = useFieldArray({
    control,
    name: "imageAlbum",
  })
  const [sheetOpen, setSheetOpen] = useState(false)

  const item = fields.length > 0 ? watch("imageAlbum.0") : undefined
  const preview = useItemPreview(item)
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
    const base = createEmptyAlbumItem(0)
    if (p.stagedBinary) {
      const meta = await applyImageFileMeta(p.stagedBinary)
      replace([{ ...base, ...p, ...meta }])
    } else {
      replace([{ ...base, ...p }])
    }
  }

  return (
    <section className="mt-12 space-y-4 border-t border-border/60 pt-6">
      <h2 className="text-sm font-medium">{NS.section.album}</h2>
      {fields.length === 0 || !hasSource ? (
        <CollectionItemSourcePanel
          item={item ?? createEmptyAlbumItem(0)}
          onChange={(p) => {
            void ingestSource(p)
          }}
          sourceError={
            albumErrors?.[0]?.imageUrl?.message as string | undefined
          }
        />
      ) : (
        <div className="border-border relative overflow-hidden rounded-xl border">
          <button
            type="button"
            className="relative block aspect-[4/3] w-full"
            onClick={() => setSheetOpen(true)}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="size-full object-contain"
              />
            ) : (
              <span className="text-muted-foreground flex aspect-[4/3] size-full items-center justify-center text-xs">
                {NS.item.no_source}
              </span>
            )}
          </button>
          <button
            type="button"
            className="bg-background/90 absolute end-3 top-3 rounded-md border p-2 shadow-sm"
            onClick={() => setSheetOpen(true)}
          >
            <PencilSquareIcon className="size-4" />
          </button>
          <p className="text-muted-foreground px-4 py-3 text-xs">
            {item?.captionCkb?.trim() || NS.item.no_caption}
          </p>
        </div>
      )}
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
