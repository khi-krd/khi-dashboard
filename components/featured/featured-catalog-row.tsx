"use client"

import Image from "next/image"
import Link from "next/link"
import { EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline"

import { isOptimizableImageSrc } from "@/lib/image-src"
import { FeaturedCategoryIcon } from "@/components/featured/featured-category-icon"
import { NS } from "@/components/featured/featured-strings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FeaturedCatalogItem } from "@/lib/featured-catalog"

export function FeaturedCatalogRow({
  item,
  isPending,
  onFeature,
  onUnfeature,
  showFeaturedBadge = true,
}: {
  item: FeaturedCatalogItem
  isPending?: boolean
  onFeature?: (item: FeaturedCatalogItem) => void
  onUnfeature?: (item: FeaturedCatalogItem) => void
  showFeaturedBadge?: boolean
}) {
  const cover = item.coverUrl?.trim()

  return (
    <article
      className={cn(
        "group border-border bg-card flex items-center gap-3 rounded-xl border p-3 transition-shadow hover:shadow-sm",
        isPending && "pointer-events-none opacity-60",
        item.featured && "ring-primary/20 ring-1",
      )}
    >
      <div
        className={cn(
          "bg-muted relative shrink-0 overflow-hidden rounded-lg",
          item.coverAspect === "book"
            ? "h-16 w-11"
            : item.coverAspect === "wide"
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
            <FeaturedCategoryIcon category={item.category} className="size-5" />
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
        <p className="line-clamp-1 text-base font-medium">{item.title || "—"}</p>
        {item.subtitle ? (
          <p className="text-muted-foreground line-clamp-1 text-sm">
            {item.subtitle}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
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
              onClick={() => onFeature?.(item)}
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
    </article>
  )
}
