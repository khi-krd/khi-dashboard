"use client"

import Image from "next/image"
import { memo, useCallback, useState } from "react"

import { isOptimizableImageSrc } from "@/lib/image-src"
import { CollectionLightbox } from "@/components/image-collections/collection-lightbox"
import { NS } from "@/components/image-collections/collections-strings"
import { albumItemSrc, sortAlbumItems } from "@/lib/image-album-utils"
import type { CollectionDto, ImageAlbumItemDto, Language } from "@/types/image-collections"

export function CollectionDetailGallery({
  collection,
  activeLang,
}: {
  collection: CollectionDto
  activeLang: Language
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const items = sortAlbumItems(collection.imageAlbum ?? [])

  const openAt = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm italic">
        {NS.gallery.empty}
      </p>
    )
  }

  return (
    <>
      <div
        className="columns-1 gap-4 sm:columns-2 lg:columns-3"
        style={{ columnGap: "1rem" }}
      >
        {items.map((item, index) => (
          <GalleryTile
            key={item.id ?? index}
            item={item}
            index={index}
            activeLang={activeLang}
            onOpen={openAt}
          />
        ))}
      </div>
      <CollectionLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        items={items}
        initialIndex={lightboxIndex}
      />
    </>
  )
}

const GalleryTile = memo(function GalleryTile({
  item,
  index,
  activeLang,
  onOpen,
}: {
  item: ImageAlbumItemDto
  index: number
  activeLang: Language
  onOpen: (index: number) => void
}) {
  const src = albumItemSrc(item)
  const caption =
    activeLang === "CKB"
      ? item.captionCkb?.trim() || item.captionKmr?.trim()
      : item.captionKmr?.trim() || item.captionCkb?.trim()

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {src ? (
        <div className="bg-muted relative w-full overflow-hidden rounded-lg">
          <Image
            src={src}
            alt={caption ?? ""}
            width={item.widthPx ?? 800}
            height={item.heightPx ?? 600}
            className="h-auto w-full object-cover transition-opacity hover:opacity-95"
            unoptimized={!isOptimizableImageSrc(src)}
          />
        </div>
      ) : (
        <div className="bg-muted text-muted-foreground flex min-h-[120px] items-center justify-center rounded-lg text-xs">
          {NS.item.no_source}
        </div>
      )}
      {caption ? (
        <p className="mt-2 px-1 text-sm font-medium leading-snug">{caption}</p>
      ) : null}
    </button>
  )
})
