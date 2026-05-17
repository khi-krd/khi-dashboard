"use client"

import {
  BookOpenIcon,
  PhotoIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"
import type { CollectionDto, CollectionType } from "@/types/image-collections"

function TypeIcon({ type }: { type: CollectionType }) {
  if (type === "SINGLE") return PhotoIcon
  if (type === "PHOTO_STORY") return BookOpenIcon
  return Squares2X2Icon
}

export function CollectionCoverThumb({
  collection,
  className,
}: {
  collection: Pick<
    CollectionDto,
    "ckbCoverUrl" | "hoverCoverUrl" | "collectionType"
  >
  className?: string
}) {
  const [hovered, setHovered] = useState(false)
  const base = collection.ckbCoverUrl?.trim()
  const hover = collection.hoverCoverUrl?.trim()
  const showHover = hovered && hover
  const Icon = TypeIcon({ type: collection.collectionType })

  if (!base && !hover) {
    return (
      <div
        className={cn(
          "bg-muted text-muted-foreground/50 relative flex size-12 items-center justify-center rounded-md",
          className,
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Icon className="size-4" aria-hidden />
      </div>
    )
  }

  const src = showHover ? hover! : base || hover!

  return (
    <div
      className={cn(
        "bg-muted relative size-12 shrink-0 overflow-hidden rounded-md",
        className,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover transition-opacity duration-300"
        unoptimized={src.startsWith("http")}
      />
    </div>
  )
}
