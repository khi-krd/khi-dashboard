"use client"

import {
  BookOpenIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import { memo, useCallback } from "react"

import { isOptimizableImageSrc } from "@/lib/image-src"
import { WritingGenrePill } from "@/components/writings/writing-genre-pill"
import { WritingListLangChips } from "@/components/writings/writing-language-chip"
import { NS } from "@/components/writings/writings-strings"
import { Button } from "@/components/ui/button"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { WritingAdminTableRow } from "@/types/writings-ui"

const WritingShelfCard = memo(function WritingShelfCard({
  row,
  onView,
  onEdit,
  onDelete,
}: {
  row: WritingAdminTableRow
  onView: (row: WritingAdminTableRow) => void
  onEdit: (row: WritingAdminTableRow) => void
  onDelete: (row: WritingAdminTableRow) => void
}) {
  const base =
    row.ckbCoverUrl?.trim() ||
    row.kmrCoverUrl?.trim() ||
    null
  const hover = row.hoverCoverUrl?.trim()
  const restingSrc = base || hover || null
  // Crossfade only when a distinct hover image exists on top of the resting one.
  const overlaySrc = hover && restingSrc && hover !== restingSrc ? hover : null
  const genres = row.bookGenres ?? []
  const seriesOrder = row.seriesOrder ?? row.seriesInfo?.seriesOrder
  const writer = row.writerCkb?.trim() || row.writerKmr?.trim()

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
        <div className="bg-muted relative aspect-[2/3] w-full overflow-hidden">
          {restingSrc ? (
            <Image
              src={restingSrc}
              alt=""
              fill
              className={cn(
                "object-cover",
                overlaySrc &&
                  "transition-opacity duration-300 group-hover:opacity-0",
              )}
              unoptimized={!isOptimizableImageSrc(restingSrc)}
            />
          ) : (
            <div className="text-muted-foreground/40 flex h-full items-center justify-center">
              <BookOpenIcon className="size-10" aria-hidden />
            </div>
          )}
          {overlaySrc ? (
            <Image
              src={overlaySrc}
              alt=""
              aria-hidden
              fill
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              unoptimized={!isOptimizableImageSrc(overlaySrc)}
            />
          ) : null}
          {row.publishedByInstitute ? (
            <span className="bg-primary/90 text-primary-foreground absolute start-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-medium">
              {NS.institute.badge}
            </span>
          ) : null}
          {seriesOrder != null && seriesOrder > 0 ? (
            <span className="bg-background/90 text-foreground absolute bottom-2 end-2 rounded-md px-1.5 py-0.5 font-mono text-xs">
              {formatCkbDigits(seriesOrder)}
            </span>
          ) : null}
        </div>
        <div className="space-y-2 p-3">
          <p className="line-clamp-2 text-sm font-medium">
            {row.titleCkb || NS.dash}
          </p>
          {row.titleKmr?.trim() ? (
            <p className="text-muted-foreground line-clamp-1 text-xs">
              {row.titleKmr}
            </p>
          ) : null}
          <p className="text-muted-foreground line-clamp-1 text-xs">
            {writer || NS.dash}
          </p>
          {genres.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {genres.slice(0, 3).map((g) => (
                <WritingGenrePill key={g} genre={g} compact />
              ))}
              {genres.length > 3 ? (
                <span className="text-muted-foreground text-[10px]">
                  +{formatCkbDigits(genres.length - 3)}
                </span>
              ) : null}
            </div>
          ) : null}
          <WritingListLangChips langs={row.contentLanguages ?? []} />
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

export function WritingsShelfGrid({
  rows,
  onView,
  onEdit,
  onDelete,
}: {
  rows: WritingAdminTableRow[]
  onView: (row: WritingAdminTableRow) => void
  onEdit: (row: WritingAdminTableRow) => void
  onDelete: (row: WritingAdminTableRow) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {rows.map((row) => (
        <WritingShelfCard
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
