"use client"

import { PhotoIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

import { CollectionLightbox } from "@/components/image-collections/collection-lightbox"
import { NS } from "@/components/image-collections/collections-strings"
import { albumItemSrc, sortAlbumItems } from "@/lib/image-album-utils"
import {
  isRichTextEmpty,
  sanitizeNewsBodyHtml,
} from "@/lib/sanitize-news-html"
import { cn } from "@/lib/utils"
import type { CollectionDto, Language } from "@/types/image-collections"

export function CollectionDetailSingle({
  collection,
  activeLang,
}: {
  collection: CollectionDto
  activeLang: Language
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const items = sortAlbumItems(collection.imageAlbum ?? [])
  const item = items[0]
  if (!item) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm italic">
        {NS.collection.empty}
      </p>
    )
  }

  const src = albumItemSrc(item)
  const caption =
    activeLang === "CKB"
      ? item.captionCkb?.trim() || item.captionKmr?.trim()
      : item.captionKmr?.trim() || item.captionCkb?.trim()
  const description =
    activeLang === "CKB"
      ? item.descriptionCkb?.trim() || item.descriptionKmr?.trim()
      : item.descriptionKmr?.trim() || item.descriptionCkb?.trim()

  return (
    <>
      <button
        type="button"
        className="group relative mx-auto block w-full max-w-3xl overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => src && setLightboxOpen(true)}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={caption ?? ""}
            className={cn(
              "mx-auto w-full rounded-xl object-contain transition-transform group-hover:scale-[1.01]",
              item.heightPx != null &&
                item.widthPx != null &&
                item.heightPx > item.widthPx
                ? "max-h-[80vh]"
                : "h-auto",
            )}
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl text-sm">
            <PhotoIcon className="size-10 opacity-40" aria-hidden />
            {NS.item.no_source}
          </div>
        )}
      </button>
      {caption ? (
        <p className="mt-4 text-center text-lg font-medium leading-relaxed">{caption}</p>
      ) : (
        <p className="text-muted-foreground mt-4 text-center text-sm italic">
          {NS.item.no_caption}
        </p>
      )}
      {!isRichTextEmpty(description) ? (
        <div
          className={cn("prose prose-base mt-6 max-w-none dark:prose-invert")}
          dangerouslySetInnerHTML={{ __html: sanitizeNewsBodyHtml(description!) }}
        />
      ) : null}
      <CollectionLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        items={items}
        initialIndex={0}
      />
    </>
  )
}
