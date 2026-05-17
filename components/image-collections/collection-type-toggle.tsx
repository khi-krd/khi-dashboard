"use client"

import {
  BookOpenIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline"

import { NS } from "@/components/image-collections/collections-strings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { CollectionType } from "@/types/image-collections"

const OPTIONS: {
  value: CollectionType
  label: string
  icon: typeof PhotoIcon
  activeClass: string
}[] = [
  {
    value: "SINGLE",
    label: NS.type.single,
    icon: PhotoIcon,
    activeClass:
      "border-primary/20 bg-primary/10 text-primary border shadow-sm",
  },
  {
    value: "GALLERY",
    label: NS.type.gallery,
    icon: Squares2X2Icon,
    activeClass:
      "border-blue-500/20 bg-blue-500/10 text-blue-700 border shadow-sm dark:text-blue-400",
  },
  {
    value: "PHOTO_STORY",
    label: NS.type.photo_story,
    icon: BookOpenIcon,
    activeClass:
      "border-purple-500/20 bg-purple-500/10 text-purple-700 border shadow-sm dark:text-purple-400",
  },
]

export function CollectionTypeToggle({
  value,
  onChange,
  editMode,
  extraItemCount = 0,
}: {
  value: CollectionType
  onChange: (v: CollectionType) => void
  editMode?: boolean
  extraItemCount?: number
}) {
  return (
    <div className="space-y-2">
      <div className="bg-muted/50 inline-flex flex-wrap rounded-lg p-1">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? opt.activeClass
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {opt.label}
            </button>
          )
        })}
      </div>
      <p className="text-muted-foreground text-xs">{NS.type.toggle.helper}</p>
      {editMode && value !== "SINGLE" && extraItemCount > 1 ? (
        <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
          <ExclamationTriangleIcon className="size-4 shrink-0" aria-hidden />
          {NS.type.switch.warning_to_single(formatCkbDigits(extraItemCount - 1))}
        </p>
      ) : null}
    </div>
  )
}
