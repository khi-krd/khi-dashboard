"use client"

import { useEffect, useState } from "react"
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"

import type { GalleryImage } from "@/components/shared/tiptap-media-nodes"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

/**
 * React NodeView for the {@link Gallery} node: renders the stored images as a
 * shadcn carousel inside the editor (and the read-only viewer). Storage is
 * unaffected — serialization still uses the node's `renderMarkdown`/`renderHTML`.
 */
export function GalleryNodeView({ node, selected }: NodeViewProps) {
  const images = ((node.attrs.images as GalleryImage[]) ?? []).filter(
    (img) => img.src,
  )
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(1)

  useEffect(() => {
    if (!api) return
    // `current` defaults to slide 1; only react to navigation/reflow events so
    // we never call setState synchronously inside the effect body.
    const onSelect = () => setCurrent(api.selectedScrollSnap() + 1)
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  if (!images.length) {
    return <NodeViewWrapper className="tiptap-gallery" />
  }

  return (
    <NodeViewWrapper
      className={cn(
        "tiptap-gallery",
        selected && "ring-ring rounded-lg ring-2 ring-offset-2",
      )}
      data-drag-handle
    >
      {/* Atom node: the media is not editable, so interactions (carousel
          buttons) work without the editor stealing focus/selection. */}
      <div contentEditable={false}>
        {images.length === 1 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[0].src}
            alt={images[0].alt ?? ""}
            className="w-full rounded-md object-cover"
          />
        ) : (
          <Carousel
            className="w-full"
            opts={{ align: "start", loop: true }}
            setApi={setApi}
          >
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={`${img.src}-${index}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt ?? ""}
                    className="w-full rounded-md object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious type="button" className="start-2" />
            <CarouselNext type="button" className="end-2" />
            <div className="bg-background/80 text-muted-foreground absolute bottom-2 end-2 rounded-full px-2 py-0.5 text-xs tabular-nums">
              {current} / {images.length}
            </div>
          </Carousel>
        )}
      </div>
    </NodeViewWrapper>
  )
}
