"use client"

import { useEffect, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline"

import { NS } from "@/components/image-collections/collections-strings"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { sanitizeNewsBodyHtml } from "@/lib/sanitize-news-html"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { ImageAlbumItemDto } from "@/types/image-collections"

function itemSrc(item: ImageAlbumItemDto) {
  return item.imageUrl?.trim() || item.externalUrl?.trim() || ""
}

export function CollectionLightbox({
  open,
  onOpenChange,
  items,
  initialIndex = 0,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  items: ImageAlbumItemDto[]
  initialIndex?: number
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(initialIndex)
  const [descOpen, setDescOpen] = useState(false)

  const sorted = [...items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  )

  useEffect(() => {
    if (!open || !api) return
    api.scrollTo(initialIndex, true)
    setCurrent(initialIndex)
    setDescOpen(false)
  }, [api, initialIndex, open])

  useEffect(() => {
    if (!api) return
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap())
      setDescOpen(false)
    }
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
      if (e.key === "ArrowLeft") api?.scrollNext()
      if (e.key === "ArrowRight") api?.scrollPrev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [api, onOpenChange, open])

  if (!open || sorted.length === 0) return null

  const item = sorted[current]
  const src = item ? itemSrc(item) : ""
  const desc = item?.descriptionCkb?.trim() || item?.descriptionKmr?.trim()

  return (
    <div className="bg-background/95 fixed inset-0 z-[100] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-muted-foreground text-sm">
          {formatCkbDigits(current + 1)} / {formatCkbDigits(sorted.length)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onOpenChange(false)}
        >
          <XMarkIcon className="size-5" />
        </Button>
      </div>
      <Carousel setApi={setApi} className="flex flex-1 flex-col justify-center px-8">
        <CarouselContent>
          {sorted.map((it, i) => {
            const url = itemSrc(it)
            return (
              <CarouselItem key={it.id ?? i} className="flex flex-col items-center">
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={it.captionCkb ?? ""}
                    className="mx-auto max-h-[80vh] w-auto rounded-lg object-contain"
                  />
                ) : null}
                <div className="mt-4 max-w-xl space-y-2 text-center">
                  {it.captionCkb?.trim() ? (
                    <p className="text-sm font-medium">{it.captionCkb}</p>
                  ) : null}
                  {it.captionKmr?.trim() ? (
                    <p className="text-muted-foreground text-xs">{it.captionKmr}</p>
                  ) : null}
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <CarouselPrevious className="start-2 rtl:rotate-180">
          <ChevronLeftIcon className="size-5" />
        </CarouselPrevious>
        <CarouselNext className="end-2 rtl:rotate-180">
          <ChevronRightIcon className="size-5" />
        </CarouselNext>
      </Carousel>
      {desc ? (
        <div className="border-border/60 border-t px-6 py-3">
          <button
            type="button"
            className="text-muted-foreground mb-2 text-xs underline"
            onClick={() => setDescOpen((o) => !o)}
          >
            {descOpen ? "شاردنەوە" : "وەسفی درێژ"}
          </button>
          {descOpen ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeNewsBodyHtml(desc),
              }}
            />
          ) : null}
        </div>
      ) : null}
      {item?.widthPx != null ? (
        <p className="text-muted-foreground border-border/60 border-t px-6 py-2 text-center font-mono text-xs">
          {item.widthPx} × {item.heightPx} px
          {item.humanReadableSize ? ` · ${item.humanReadableSize}` : ""}
          {item.mimeType ? ` · ${item.mimeType}` : ""}
        </p>
      ) : null}
    </div>
  )
}
