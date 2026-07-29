"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline"

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
import type { BrochureDto } from "@/types/sounds"

export function SoundBrochureLightbox({
  open,
  onOpenChange,
  brochures,
  initialIndex = 0,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  brochures: BrochureDto[]
  initialIndex?: number
}) {
  const [api, setApi] = useState<CarouselApi>()
  // Reset to the clicked slide on open; derived here rather than assigned from
  // the effect below, which only drives the carousel itself.
  const [current, setCurrent] = useSyncedState(
    [open, initialIndex],
    () => (open ? initialIndex : undefined),
    () => initialIndex,
  )

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

  if (!open || brochures.length === 0) return null

  const sorted = [...brochures].sort(
    (a, b) => (a.brochureOrder ?? 0) - (b.brochureOrder ?? 0),
  )

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
          {sorted.map((b, i) => (
            <CarouselItem key={b.id ?? i} className="flex flex-col items-center">
              {b.imageUrl ? (
                <div className="relative max-h-[80vh] w-full max-w-3xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.imageUrl}
                    alt={b.caption ?? ""}
                    className="mx-auto max-h-[80vh] w-auto rounded-lg object-contain"
                  />
                </div>
              ) : null}
              {b.caption?.trim() ? (
                <p className="text-muted-foreground mt-4 max-w-xl text-center text-sm">
                  {b.caption}
                </p>
              ) : null}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="start-2 rtl:rotate-180">
          <ChevronLeftIcon className="size-5" />
        </CarouselPrevious>
        <CarouselNext className="end-2 rtl:rotate-180">
          <ChevronRightIcon className="size-5" />
        </CarouselNext>
      </Carousel>
    </div>
  )
}
