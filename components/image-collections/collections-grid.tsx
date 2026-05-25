"use client"

import {
  EyeIcon,
  PencilSquareIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { memo, useCallback } from "react"

import { CollectionTypePill } from "@/components/image-collections/collection-type-pill"
import { NS } from "@/components/image-collections/collections-strings"
import { HoverImage } from "@/components/shared/hover-image"
import { Button } from "@/components/ui/button"
import { formatNewsDateShort } from "@/lib/intl-ckb"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { getCollectionCoverUrl } from "@/types/image-collections-ui"
import type { CollectionAdminTableRow } from "@/types/image-collections-ui"

const CollectionGridCard = memo(function CollectionGridCard({
  row,
  onView,
  onEdit,
  onDelete,
}: {
  row: CollectionAdminTableRow
  onView: (row: CollectionAdminTableRow) => void
  onEdit: (row: CollectionAdminTableRow) => void
  onDelete: (row: CollectionAdminTableRow) => void
}) {
  const cover = getCollectionCoverUrl(row) ?? row.ckbCoverUrl?.trim()
  const hover = row.hoverCoverUrl?.trim()
  const count = row.imageAlbum?.length ?? 0

  const handleView = useCallback(() => onView(row), [onView, row])
  const handleEdit = useCallback(() => onEdit(row), [onEdit, row])
  const handleDelete = useCallback(() => onDelete(row), [onDelete, row])

  return (
    <article className="group border-border bg-card relative overflow-hidden rounded-lg border">
      <button
        type="button"
        className="block w-full text-start"
        onClick={handleView}
      >
        <div className="bg-muted relative aspect-[4/3] w-full overflow-hidden">
          <HoverImage
            src={cover}
            hoverSrc={hover}
            fallback={
              <div className="text-muted-foreground/40 flex h-full items-center justify-center">
                <PhotoIcon className="size-10" aria-hidden />
              </div>
            }
          />
          <div className="absolute start-2 top-2">
            <CollectionTypePill collectionType={row.collectionType} compact />
          </div>
          {count > 1 ? (
            <span className="bg-background/90 text-foreground absolute bottom-2 end-2 rounded-md px-1.5 py-0.5 font-mono text-xs">
              {formatCkbDigits(count)}
            </span>
          ) : null}
        </div>
        <div className="space-y-1 p-3">
          <p className="line-clamp-2 text-sm font-medium">
            {row.titleCkb || NS.dash}
          </p>
          {row.titleKmr?.trim() ? (
            <p className="text-muted-foreground line-clamp-1 text-xs">
              {row.titleKmr}
            </p>
          ) : null}
          <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
            <span className="truncate">
              {row.topicNameCkb?.trim() || NS.dash}
            </span>
            <span className="shrink-0 font-mono">
              {row.publishmentDate
                ? formatNewsDateShort(row.publishmentDate)
                : NS.dash}
            </span>
          </div>
        </div>
      </button>
      <div
        className={cn(
          "absolute inset-x-0 top-0 flex justify-end gap-1 p-2 transition-opacity",
          "opacity-100 md:opacity-0 md:group-hover:opacity-100",
        )}
      >
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="size-8"
          onClick={(e) => {
            e.stopPropagation()
            handleView()
          }}
        >
          <EyeIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="size-8"
          onClick={(e) => {
            e.stopPropagation()
            handleEdit()
          }}
        >
          <PencilSquareIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="text-destructive size-8"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </article>
  )
})

export function CollectionsGrid({
  rows,
  onView,
  onEdit,
  onDelete,
}: {
  rows: CollectionAdminTableRow[]
  onView: (row: CollectionAdminTableRow) => void
  onEdit: (row: CollectionAdminTableRow) => void
  onDelete: (row: CollectionAdminTableRow) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {rows.map((row) => (
        <CollectionGridCard
          key={row.id ?? row.sortTitleCkb}
          row={row}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
