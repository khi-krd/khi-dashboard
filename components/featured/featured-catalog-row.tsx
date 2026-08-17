"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ExclamationTriangleIcon,
  EyeIcon,
  PencilSquareIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"

import { isOptimizableImageSrc, isUsableImageUrl } from "@/lib/image-src"
import { FeaturedCategoryIcon } from "@/components/featured/featured-category-icon"
import { blockedReason, NS } from "@/components/featured/featured-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  resolvedSlideImage,
  type FeaturedCatalogItem,
} from "@/lib/featured-catalog"

export function FeaturedCatalogRow({
  item,
  isPending,
  capReached = false,
  onFeature,
  onUnfeature,
  showFeaturedBadge = true,
}: {
  item: FeaturedCatalogItem
  isPending?: boolean
  capReached?: boolean
  /**
   * `featureImageUrl` is only present when the row supplied one — sources that
   * already have a usable picture omit it, which the API reads as "leave the
   * stored value alone".
   */
  onFeature?: (item: FeaturedCatalogItem, featureImageUrl?: string) => void
  onUnfeature?: (item: FeaturedCatalogItem) => void
  showFeaturedBadge?: boolean
}) {
  // Prefer the hero picture so the thumbnail matches what the website paints.
  const heroImage = item.featureImageUrl?.trim() || null
  const cover = heroImage ?? item.coverUrl?.trim()
  const thumbAspect = heroImage ? "wide" : item.coverAspect

  // A hero picture chosen right here, for sources that cannot be featured
  // without one. It rides along with the toggle in a single PATCH, which is
  // also the only order the backend accepts: it validates the image on the
  // same request that turns `featured` on.
  const [draftImage, setDraftImage] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)

  const draft = draftImage.trim()
  // A half-typed URL is worse than none: it passes the backend's blank check
  // and produces a slide pointing at a 404 — precisely the silently-broken
  // slide the strict-image rule exists to prevent.
  const draftUsable = isUsableImageUrl(draft)
  const effectiveItem = draftUsable ? { ...item, featureImageUrl: draft } : item

  // Derived from the item's *stored* state, never the draft: keying it off
  // `blocked` collapsed the picker the moment a URL became valid, taking the
  // field being typed into with it.
  const needsImage =
    !item.featured && item.strictImage && resolvedSlideImage(item) == null

  // An already-featured row is never blocked: removing it is always allowed,
  // and the cap only ever bites on the way in.
  const blocked = item.featured ? null : blockedReason(effectiveItem)
  // The cap is advisory here — its value is a client-side copy of a
  // database-only setting, so it warns but never withholds the request. The
  // server stays the authority and its reason is surfaced on rejection.
  const capWarning = !item.featured && capReached ? NS.blocked.capReached : null
  const disabledReason = blocked
  const warning = blocked ?? capWarning

  return (
    <article
      className={cn(
        "group border-border bg-card rounded-xl border p-3 transition-shadow hover:shadow-sm",
        isPending && "pointer-events-none opacity-60",
        item.featured && "ring-primary/20 ring-1",
      )}
    >
      <div className="flex items-center gap-3">
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
              <FeaturedCategoryIcon
                category={item.category}
                className="size-5"
              />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-normal">
              {item.categoryLabel}
            </Badge>
            {showFeaturedBadge && item.featured ? (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 font-normal">
                {NS.badges.featured}
              </Badge>
            ) : null}
          </div>
          <p className="line-clamp-1 text-base font-medium">
            {item.title || "—"}
          </p>
          {item.subtitle ? (
            <p className="text-muted-foreground line-clamp-1 text-sm">
              {item.subtitle}
            </p>
          ) : null}
          {warning ? (
            <p className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <ExclamationTriangleIcon
                className="size-3.5 shrink-0"
                aria-hidden
              />
              {warning}
            </p>
          ) : null}
          {draftUsable && !item.featured ? (
            <p className="text-primary mt-1 text-xs">
              {NS.field.featureImageSet}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {needsImage ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(pickerOpen && "bg-accent")}
              onClick={() => setPickerOpen((v) => !v)}
              aria-expanded={pickerOpen}
              aria-label={NS.actions.editImage}
            >
              <PhotoIcon className="size-4" />
            </Button>
          ) : null}
          {item.canFeature ? (
            item.featured ? (
              <Button
                type="button"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => onUnfeature?.(item)}
              >
                {NS.actions.remove}
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                disabled={disabledReason != null}
                title={disabledReason ?? undefined}
                // The picture goes out on the same request as the toggle: the
                // backend validates it there, so a separate "save image" step
                // first would have nothing to attach it to.
                onClick={() => onFeature?.(item, draftUsable ? draft : undefined)}
              >
                {NS.actions.add}
              </Button>
            )
          ) : null}
          <Button
            nativeButton={false}
            variant="ghost"
            size="icon-sm"
            render={<Link href={item.detailHref} />}
            aria-label={NS.actions.view}
          >
            <EyeIcon className="size-4" />
          </Button>
          <Button
            nativeButton={false}
            variant="ghost"
            size="icon-sm"
            render={<Link href={item.editHref} />}
            aria-label={NS.actions.edit}
          >
            <PencilSquareIcon className="size-4" />
          </Button>
        </div>
      </div>

      {needsImage && pickerOpen ? (
        <div className="mt-3 border-t pt-3">
          <MediaCoverUpload
            label={NS.field.featureImage}
            aspectClass="aspect-video"
            helperText={NS.field.featureImageHint}
            previewUrl={draft || null}
            urlValue={draftImage}
            onUrlChange={setDraftImage}
          />
        </div>
      ) : null}
    </article>
  )
}
