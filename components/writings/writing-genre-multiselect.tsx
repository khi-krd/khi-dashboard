"use client"

import { WritingGenrePill } from "@/components/writings/writing-genre-pill"
import { NS } from "@/components/writings/writings-strings"
import { FieldError } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import {
  GENRE_FAMILY_CLASSES,
  GENRE_GROUPS,
  type GenreFamily,
} from "@/lib/writings-genres"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { BookGenre } from "@/types/writings"

const FAMILY_LABELS: Record<GenreFamily, string> = {
  literary: NS.genre.group.literary,
  history_society: NS.genre.group.history_society,
  knowledge: NS.genre.group.knowledge,
  culture_life: NS.genre.group.culture_life,
}

export function WritingGenreMultiselect({
  value,
  onChange,
  error,
}: {
  value: BookGenre[]
  onChange: (genres: BookGenre[]) => void
  error?: string
}) {
  const selected = new Set(value)

  function toggle(genre: BookGenre) {
    if (selected.has(genre)) {
      onChange(value.filter((g) => g !== genre))
    } else {
      onChange([...value, genre])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium">{NS.section.genres}</Label>
        <span className="text-muted-foreground text-xs">
          {value.length > 0
            ? NS.genre.selected_count(formatCkbDigits(value.length))
            : NS.genre.empty_helper}
        </span>
      </div>

      {GENRE_GROUPS.map((group) => (
        <section key={group.family} className="space-y-2">
          <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {FAMILY_LABELS[group.family]}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.genres.map((genre) => {
              const isOn = selected.has(genre)
              const familyClasses = GENRE_FAMILY_CLASSES[group.family]
              return (
                <WritingGenrePill
                  key={genre}
                  genre={genre}
                  onClick={() => toggle(genre)}
                  className={cn(
                    isOn && familyClasses.selected,
                    !isOn && "opacity-80",
                  )}
                />
              )
            })}
          </div>
        </section>
      ))}

      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  )
}
