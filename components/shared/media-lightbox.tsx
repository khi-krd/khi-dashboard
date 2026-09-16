"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

import { useSyncedState } from "@/hooks/use-synced-state"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { formatCkbDigits } from "@/lib/intl-ckb"

export type LightboxItem = {
  src: string
  alt?: string | null
  caption?: string | null
  type?: "IMAGE" | "VIDEO"
  posterUrl?: string | null
}

/**
 * Shared full-screen media viewer: click any read-only thumbnail to open it
 * full-size. Backdrop click, the X button, and ESC all close; arrows navigate.
 */
export function MediaLightbox({
  open,
  onOpenChange,
  items,
  initialIndex = 0,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  items: LightboxItem[]
  initialIndex?: number
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useSyncedState(
    [open, initialIndex],
    () => (open ? initialIndex : undefined),
    () => initialIndex,
  )

  // Embla defaults to `direction: "ltr"`. Inside an RTL page that mismatch
  // translates every slide off-screen, so the viewer opens as a blank
  // overlay. Measure the direction the overlay actually mounts into — it can
  // sit inside an LTR subtree (e.g. a KMR preview) on an RTL page — and hand
  // it to Embla via opts.
  const [rtl, setRtl] = useState(false)
  const measureDirection = useCallback((node: HTMLDivElement | null) => {
    if (node) setRtl(node.matches(":dir(rtl)"))
  }, [])

  useEffect(() => {
    if (!open || !api) return
    api.scrollTo(initialIndex, true)
  }, [api, initialIndex, open])

  useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api, setCurrent])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
      // In RTL the "forward" arrow points left.
      if (e.key === "ArrowLeft") {
        if (rtl) api?.scrollNext()
        else api?.scrollPrev()
      }
      if (e.key === "ArrowRight") {
        if (rtl) api?.scrollPrev()
        else api?.scrollNext()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [api, onOpenChange, open, rtl])

  if (!open || items.length === 0) return null

  const multi = items.length > 1

  return (
    <div
      ref={measureDirection}
      className="bg-background/95 fixed inset-0 z-[100] flex flex-col"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-muted-foreground text-sm">
          {formatCkbDigits(current + 1)} / {formatCkbDigits(items.length)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="داخستن"
          onClick={() => onOpenChange(false)}
        >
          <XMarkIcon className="size-5" />
        </Button>
      </div>
      <Carousel
        setApi={setApi}
        opts={{ direction: rtl ? "rtl" : "ltr" }}
        className="flex flex-1 flex-col justify-center px-8"
      >
        <CarouselContent>
          {items.map((it, i) => {
            const caption = it.caption?.trim()
            return (
              <CarouselItem
                key={`${it.src}-${i}`}
                className="flex flex-col items-center"
              >
                <div onClick={(e) => e.stopPropagation()}>
                  {it.type === "VIDEO" ? (
                    <video
                      src={it.src}
                      poster={it.posterUrl?.trim() || undefined}
                      controls
                      className="mx-auto max-h-[80vh] w-auto rounded-lg"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.src}
                      alt={it.alt ?? ""}
                      className="mx-auto max-h-[80vh] w-auto rounded-lg object-contain"
                    />
                  )}
                </div>
                {caption ? (
                  <p className="mt-4 max-w-xl text-center text-sm font-medium">
                    {caption}
                  </p>
                ) : null}
              </CarouselItem>
            )
          })}
        </CarouselContent>
        {multi ? (
          <span onClick={(e) => e.stopPropagation()}>
            <CarouselPrevious className="start-2 rtl:rotate-180">
              <ChevronLeftIcon className="size-5" />
            </CarouselPrevious>
            <CarouselNext className="end-2 rtl:rotate-180">
              <ChevronRightIcon className="size-5" />
            </CarouselNext>
          </span>
        ) : null}
      </Carousel>
    </div>
  )
}

/** Boilerplate for call sites: `{ open, index, openAt, onOpenChange }`. */
export function useLightbox() {
  const [index, setIndex] = useState<number | null>(null)
  const openAt = useCallback((i: number) => setIndex(i), [])
  const onOpenChange = useCallback(
    (v: boolean) => setIndex(v ? (index ?? 0) : null),
    [index],
  )
  return { open: index !== null, index: index ?? 0, openAt, onOpenChange }
}
