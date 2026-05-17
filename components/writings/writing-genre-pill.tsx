"use client"

import {
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  HeartIcon,
  MapIcon,
  MusicalNoteIcon,
  SparklesIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"

import { GENRE_LABEL_CKB } from "@/components/writings/writings-strings"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { GENRE_FAMILY_CLASSES, genreFamily } from "@/lib/writings-genres"
import { cn } from "@/lib/utils"
import type { BookGenre } from "@/types/writings"

const GENRE_ICONS: Record<
  BookGenre,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  NOVEL: BookOpenIcon,
  SHORT_STORY: DocumentTextIcon,
  POETRY: SparklesIcon,
  ESSAY: DocumentTextIcon,
  DRAMA: MusicalNoteIcon,
  HISTORY: ClockIcon,
  BIOGRAPHY: UsersIcon,
  POLITICAL: GlobeAltIcon,
  GEOGRAPHY: MapIcon,
  ACADEMIC: AcademicCapIcon,
  REFERENCE: BookOpenIcon,
  LINGUISTICS: DocumentTextIcon,
  RELIGIOUS: HeartIcon,
  FOLKLORE: UserGroupIcon,
  CHILDREN: SparklesIcon,
  OTHER: BookOpenIcon,
}

const GENRE_ABBR: Partial<Record<BookGenre, string>> = {
  NOVEL: "ڕۆ",
  SHORT_STORY: "چک",
  POETRY: "شع",
  HISTORY: "مژ",
  BIOGRAPHY: "ژی",
  ACADEMIC: "ئک",
  CHILDREN: "من",
}

export function WritingGenrePill({
  genre,
  compact,
  className,
  onClick,
}: {
  genre: BookGenre
  compact?: boolean
  className?: string
  onClick?: () => void
}) {
  const family = genreFamily(genre)
  const classes = GENRE_FAMILY_CLASSES[family].pill
  const Icon = GENRE_ICONS[genre]
  const label = GENRE_LABEL_CKB[genre]

  const pill = (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick()
            }
          : undefined
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium",
        classes,
        onClick && "cursor-pointer hover:opacity-90",
        className,
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {compact ? (GENRE_ABBR[genre] ?? label.slice(0, 2)) : label}
    </span>
  )

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger render={pill} />
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    )
  }

  return pill
}
