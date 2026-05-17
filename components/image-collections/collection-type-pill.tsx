"use client"

import {
  BookOpenIcon,
  PhotoIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline"

import { NS } from "@/components/image-collections/collections-strings"
import { cn } from "@/lib/utils"
import type { CollectionType } from "@/types/image-collections"

const styles: Record<
  CollectionType,
  { className: string; icon: typeof PhotoIcon; label: string }
> = {
  SINGLE: {
    className:
      "bg-primary/10 text-primary border-primary/20",
    icon: PhotoIcon,
    label: NS.type.single,
  },
  GALLERY: {
    className:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    icon: Squares2X2Icon,
    label: NS.type.gallery,
  },
  PHOTO_STORY: {
    className:
      "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    icon: BookOpenIcon,
    label: NS.type.photo_story,
  },
}

export function CollectionTypePill({
  collectionType,
  compact,
  className,
}: {
  collectionType: CollectionType
  compact?: boolean
  className?: string
}) {
  const cfg = styles[collectionType]
  const Icon = cfg.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        cfg.className,
        className,
      )}
    >
      <Icon className={compact ? "size-3" : "size-3.5"} aria-hidden />
      {cfg.label}
    </span>
  )
}
