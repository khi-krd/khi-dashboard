"use client"

import {
  Bars2Icon,
  EyeIcon,
  PencilSquareIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { isOptimizableImageSrc, isUsableImageUrl } from "@/lib/image-src"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
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
  featureImageUrl,
  strictImage = false,
  coverAspect = "square",
  fallbackIcon,
  detailHref,
  editHref,
  isPending,
  onRemove,
  onFeatureImageChange,
}: {
  id: string
  order: number
  title: string
  subtitle?: string | null
  categoryLabel?: string
  coverUrl?: string | null
  featureImageUrl?: string | null
  /**
   * True for the three institutional sources, where clearing the hero with no
   * fallback cover behind it is rejected rather than silently dropped.
   */
  strictImage?: boolean
  coverAspect?: "square" | "book" | "wide"
  fallbackIcon: React.ReactNode
  detailHref: string
  editHref: string
  isPending?: boolean
  onRemove: () => void
  /**
   * Receives `""` to clear — never `null`, which the API reads as "leave
   * unchanged" (§4.5).
   */
  onFeatureImageChange?: (url: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })
  const [imageOpen, setImageOpen] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Local echo of the picture. The uploader is fully controlled off `previewUrl`,
  // and the server value only returns after PATCH → invalidate → a 7-category
  // refetch, so without this the preview stays blank for the whole round trip
  // and the URL field cannot be typed into at all.
  const [draftImage, setDraftImage] = useState<string | null>(null)

  const heroImage = featureImageUrl?.trim() || null
  const shownImage = draftImage !== null ? draftImage.trim() || null : heroImage
  const imageDirty =
    draftImage !== null && draftImage.trim() !== (heroImage ?? "")
  // Show what the website will actually paint: the hero picture wins over the
  // cover, exactly as the backend's `firstNonBlank` resolves it (§4.5).
  const cover = heroImage ?? coverUrl?.trim()
  // A hero picture is 16:9, so a book/square thumb would misrepresent the crop.
  const thumbAspect = heroImage ? "wide" : coverAspect

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group border-border bg-card relative rounded-xl border p-3 shadow-sm transition-shadow",
        isDragging && "z-10 shadow-lg ring-2 ring-primary/20",
        isPending && "pointer-events-none opacity-60",
      )}
    >
      <div className="flex items-center gap-3">
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
            thumbAspect === "book"
              ? "h-16 w-11"
              : thumbAspect === "wide"
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
              unoptimized={!isOptimizableImageSrc(cover)}
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
          {onFeatureImageChange ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(imageOpen && "bg-accent", heroImage && "text-primary")}
              onClick={() => setImageOpen((v) => !v)}
              aria-expanded={imageOpen}
              aria-label={imageOpen ? NS.actions.closeImage : NS.actions.editImage}
            >
              <PhotoIcon className="size-4" />
            </Button>
          ) : null}
          <Button
            nativeButton={false}
            variant="ghost"
            size="icon-sm"
            render={<Link href={detailHref} />}
            aria-label={NS.actions.view}
          >
            <EyeIcon className="size-4" />
          </Button>
          <Button
            nativeButton={false}
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

      {onFeatureImageChange && imageOpen ? (
        <div className="mt-3 border-t pt-3">
          <MediaCoverUpload
            label={NS.field.featureImage}
            aspectClass="aspect-video"
            helperText={NS.field.featureImageHint}
            previewUrl={shownImage}
            urlValue={shownImage ?? ""}
            // Local only. MediaCoverUpload fires this on every keystroke of its
            // URL field, so patching here would mean one PATCH per character —
            // and each one disables the row mid-typing via `isPending`.
            onUrlChange={setDraftImage}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              // Two ways to be un-saveable: a half-typed URL, which the backend
              // accepts (it only rejects blanks) and turns into a slide with a
              // 404 picture; and clearing the only image a strict source has,
              // which it rejects outright. An empty draft stays saveable
              // otherwise — "" is the documented clear signal.
              disabled={
                !imageDirty ||
                (shownImage != null && !isUsableImageUrl(shownImage)) ||
                (strictImage && !shownImage && !coverUrl)
              }
              onClick={() =>
                // "" is the documented clear signal; null would mean "unchanged".
                // The draft is deliberately kept: clearing it here would snap the
                // preview back to the old picture until the refetch caught up.
                // Once the server value matches, `imageDirty` goes false on its own.
                onFeatureImageChange((draftImage ?? "").trim())
              }
            >
              {NS.actions.saveImage}
            </Button>
            {imageDirty ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDraftImage(null)}
              >
                {NS.actions.revertImage}
              </Button>
            ) : null}
            {!shownImage ? (
              strictImage && !coverUrl ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {NS.field.featureImageRequired}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  {NS.field.featureImageFallback}
                </p>
              )
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
