"use client"

import {
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  MusicalNoteIcon,
  PhotoIcon,
  Squares2X2Icon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"

import { NS } from "@/components/about/about-strings"
import { cn } from "@/lib/utils"
import type { AboutBlockType } from "@/types/about"

export const BLOCK_TYPE_VARIANTS: Record<
  AboutBlockType,
  {
    label: string
    icon: ComponentType<SVGProps<SVGSVGElement>>
    tint: string
  }
> = {
  TEXT: {
    label: NS.block.text,
    icon: DocumentTextIcon,
    tint: "bg-primary/10 text-primary border-primary/20",
  },
  IMAGE: {
    label: NS.block.image,
    icon: PhotoIcon,
    tint:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  VIDEO: {
    label: NS.block.video,
    icon: VideoCameraIcon,
    tint: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  },
  AUDIO: {
    label: NS.block.audio,
    icon: MusicalNoteIcon,
    tint:
      "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },
  GALLERY: {
    label: NS.block.gallery,
    icon: Squares2X2Icon,
    tint:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  QUOTE: {
    label: NS.block.quote,
    icon: ChatBubbleBottomCenterTextIcon,
    tint:
      "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
  },
  STAT: {
    label: NS.block.stat,
    icon: ChartBarIcon,
    tint:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
}

export const BLOCK_TYPES = Object.keys(
  BLOCK_TYPE_VARIANTS,
) as AboutBlockType[]

export function BlockTypePill({
  type,
  className,
}: {
  type: AboutBlockType
  className?: string
}) {
  const variant = BLOCK_TYPE_VARIANTS[type]
  const Icon = variant.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        variant.tint,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {variant.label}
    </span>
  )
}

export function BlockTypeIcon({
  type,
  className,
}: {
  type: AboutBlockType
  className?: string
}) {
  const Icon = BLOCK_TYPE_VARIANTS[type].icon
  return <Icon className={className} aria-hidden />
}
