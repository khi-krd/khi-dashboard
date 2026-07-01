"use client"

import {
  Bars2Icon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import Link from "next/link"

import { NS } from "@/components/featured/featured-strings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"

export function FeaturedSortableRow({
  id,
  order,
  title,
  subtitle,
  categoryLabel,
  coverUrl,
  coverAspect = "square",
  fallbackIcon,
  detailHref,
  editHref,
  isPending,
  onRemove,
}: {
  id: string
  order: number
  title: string
  subtitle?: string | null
  categoryLabel?: string
  coverUrl?: string | null
  coverAspect?: "square" | "book" | "wide"
  fallbackIcon: React.ReactNode
  detailHref: string
  editHref: string
  isPending?: boolean
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const cover = coverUrl?.trim()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group border-border bg-card relative flex items-center gap-3 rounded-xl border p-3 shadow-sm transition-shadow",
        isDragging && "z-10 shadow-lg ring-2 ring-primary/20",
        isPending && "pointer-events-none opacity-60",
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground flex shrink-0 cursor-grab touch-none items-center rounded-md p-1.5 transition-colors active:cursor-grabbing"
        aria-label={NS.actions.drag}
        {...attributes}
        {...listeners}
      >
        <Bars2Icon className="size-5" aria-hidden />
      </button>

      <div
        className={cn(
          "bg-muted relative shrink-0 overflow-hidden rounded-lg",
          coverAspect === "book"
            ? "h-16 w-11"
            : coverAspect === "wide"
              ? "h-11 w-16"
              : "size-14",
        )}
      >
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            className="object-cover"
            unoptimized={cover.startsWith("http")}
          />
        ) : (
          <div className="text-muted-foreground/40 flex h-full w-full items-center justify-center">
            {fallbackIcon}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="bg-primary/10 text-primary inline-flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold tabular-nums">
            {formatCkbDigits(order + 1)}
          </span>
          {categoryLabel ? (
            <Badge variant="secondary" className="font-normal">
              {categoryLabel}
            </Badge>
          ) : null}
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 font-normal">
            {NS.badges.featured}
          </Badge>
        </div>
        <p className="line-clamp-1 text-base font-medium">{title || "—"}</p>
        {subtitle ? (
          <p className="text-muted-foreground line-clamp-1 text-sm">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          render={<Link href={detailHref} />}
          aria-label={NS.actions.view}
        >
          <EyeIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          render={<Link href={editHref} />}
          aria-label={NS.actions.edit}
        >
          <PencilSquareIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:text-destructive"
          onClick={onRemove}
          aria-label={NS.actions.remove}
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
