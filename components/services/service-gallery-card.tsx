"use client"

import {
  Bars2Icon,
  PencilSquareIcon,
  PhotoIcon,
  TrashIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Badge } from "@/components/ui/badge"
import { NS } from "@/components/services/services-strings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { ServiceGalleryMediaFormValues } from "@/lib/validations/services"

function previewUrl(slot: ServiceGalleryMediaFormValues): string | null {
  const url = slot.url?.trim()
  if (!url) return null
  if (slot.type === "VIDEO") {
    return slot.posterUrl?.trim() || url
  }
  return url
}

function truncateUrl(url: string, max = 48): string {
  if (url.length <= max) return url
  return `${url.slice(0, max)}…`
}

export function ServiceGalleryCard({
  id,
  index,
  slot,
  onEdit,
  onRemove,
}: {
  id: string
  index: number
  slot: ServiceGalleryMediaFormValues
  onEdit: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const thumb = previewUrl(slot)
  const isVideo = slot.type === "VIDEO"
  const urlLabel = slot.url?.trim() || NS.gallery.noUrl

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-border group flex gap-3 rounded-lg border p-3"
    >
      <div className="border-border bg-muted/40 relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border">
        {thumb ? (
          isVideo && !slot.posterUrl?.trim() ? (
            <video
              src={thumb}
              className="size-full object-cover"
              muted
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="size-full object-cover" />
          )
        ) : isVideo ? (
          <VideoCameraIcon className="text-muted-foreground size-6" />
        ) : (
          <PhotoIcon className="text-muted-foreground size-6" />
        )}
      </div>
      <button
        type="button"
        className="min-w-0 flex-1 text-start"
        onClick={onEdit}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-primary font-mono text-xs">
            #{formatCkbDigits(index + 1)}
          </p>
          <Badge variant="secondary" className="text-[10px]">
            {isVideo ? NS.gallery.typeVideo : NS.gallery.typeImage}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1 truncate font-mono text-[10px]">
          {truncateUrl(urlLabel)}
        </p>
        {slot.alt?.trim() ? (
          <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
            {slot.alt.trim()}
          </p>
        ) : null}
      </button>
      <div className="flex shrink-0 flex-col gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground rounded p-1"
          onClick={onEdit}
          aria-label={NS.action.edit}
        >
          <PencilSquareIcon className="size-4" />
        </button>
        <button
          type="button"
          className="text-muted-foreground hover:text-destructive rounded p-1"
          onClick={onRemove}
          aria-label={NS.action.delete}
        >
          <TrashIcon className="size-4" />
        </button>
        <button
          type="button"
          className={cn(
            "text-muted-foreground cursor-grab rounded p-1",
          )}
          {...attributes}
          {...listeners}
          aria-label="Reorder"
        >
          <Bars2Icon className="size-4" />
        </button>
      </div>
    </div>
  )
}
