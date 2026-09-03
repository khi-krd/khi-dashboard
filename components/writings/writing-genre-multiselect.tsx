"use client"

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useMemo } from "react"

import { BG } from "@/components/writings/genres/book-genres-strings"
import { WritingGenrePill } from "@/components/writings/writing-genre-pill"
import { NS } from "@/components/writings/writings-strings"
import { FieldError } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useBookGenresQuery } from "@/hooks/useBookGenres"
import {
  GENRE_FAMILY_CLASSES,
  GENRE_GROUPS,
  genreFamily,
  type GenreFamily,
} from "@/lib/writings-genres"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { bookGenreLabel, type BookGenreDto } from "@/types/book-genre"
import type { BookGenre } from "@/types/writings"

const FAMILY_LABELS: Record<GenreFamily, string> = {
  literary: NS.genre.group.literary,
  history_society: NS.genre.group.history_society,
  knowledge: NS.genre.group.knowledge,
  culture_life: NS.genre.group.culture_life,
}

/**
 * The genre picker.
 *
 * Selection is held as **slugs**, not ids. Both the old and the new backend
 * speak slugs, every display component in the module reads slugs, and a book
 * loaded before the genre list has arrived still has to show its chips — ids
 * would leave all three cases needing a lookup that may not have resolved yet.
 * `writingFormValuesToMultipart` maps the slugs to `genreIds` at submit time,
 * which is the one place the id form is actually needed.
 */
export function WritingGenreMultiselect({
  value,
  onChange,
  error,
}: {
  value: BookGenre[]
  onChange: (genres: BookGenre[]) => void
  error?: string
}) {
  // Active genres only: a retired genre must not be attachable to a book, but
  // books that already carry it keep it — see `attached` below.
  const genresQ = useBookGenresQuery(false)
  const selected = useMemo(() => new Set(value), [value])

  const options = useMemo(() => genresQ.data ?? [], [genresQ.data])
  // Only an unreachable endpoint falls back to the list compiled into this
  // build — that is exactly how the picker behaved before genres became
  // editable, so saving a book never depends on this request. An endpoint that
  // answers with an empty list is a different thing: there genuinely are no
  // genres yet, and offering the built-ins would let the editor attach slugs
  // that have no row behind them.
  const useFallback = genresQ.isError
  const isEmpty =
    !genresQ.isLoading && !genresQ.isError && options.length === 0

  /**
   * Slugs already on this book that the picker does not offer — a genre that
   * has since been hidden, or one this build has no entry for. They stay
   * selected and removable but cannot be re-added, which is what "books that
   * already have it keep it" means in practice.
   */
  const attached = useMemo(() => {
    if (genresQ.isLoading) return []
    const offered = new Set<string>(
      useFallback
        ? GENRE_GROUPS.flatMap((g) => g.genres)
        : options.map((g) => g.slug),
    )
    return value.filter((slug) => !offered.has(slug))
  }, [genresQ.isLoading, useFallback, options, value])

  function toggle(slug: string) {
    if (selected.has(slug)) {
      onChange(value.filter((g) => g !== slug))
    } else {
      onChange([...value, slug])
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

      {genresQ.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      ) : useFallback ? (
        <FallbackGroups selected={selected} onToggle={toggle} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((genre) => (
            <GenreChip
              key={genre.slug}
              genre={genre}
              isOn={selected.has(genre.slug)}
              onClick={() => toggle(genre.slug)}
            />
          ))}
        </div>
      )}

      {useFallback ? (
        <p className="text-muted-foreground border-border/60 bg-muted/40 flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed">
          <ExclamationTriangleIcon
            className="mt-0.5 size-4 shrink-0"
            aria-hidden
          />
          <span>{BG.form.fallbackNotice}</span>
        </p>
      ) : null}

      {isEmpty ? (
        <p className="text-muted-foreground text-xs">{BG.form.empty}</p>
      ) : null}

      {attached.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {BG.form.attachedTitle}
          </h3>
          <div className="flex flex-wrap gap-2">
            {attached.map((slug) => (
              <WritingGenrePill
                key={slug}
                genre={slug}
                onClick={() => toggle(slug)}
                className={GENRE_FAMILY_CLASSES[genreFamily(slug)].selected}
              />
            ))}
          </div>
          <p className="text-muted-foreground text-xs">{BG.form.attachedHint}</p>
        </section>
      ) : null}

      <Link
        href="/dashboard/writings/genres"
        className="text-muted-foreground hover:text-foreground inline-block text-xs underline-offset-4 transition-colors hover:underline"
      >
        {BG.form.manageLink}
      </Link>

      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  )
}

/** A genre from the API — labelled by its own name, coloured by its slug. */
function GenreChip({
  genre,
  isOn,
  onClick,
}: {
  genre: BookGenreDto
  isOn: boolean
  onClick: () => void
}) {
  const family = genreFamily(genre.slug)
  const classes = GENRE_FAMILY_CLASSES[family]
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isOn}
      title={genre.slug}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-90",
        isOn ? classes.selected : cn(classes.pill, "opacity-80"),
      )}
    >
      {bookGenreLabel(genre)}
    </button>
  )
}

/** The list compiled into this build, used only when the API is unavailable. */
function FallbackGroups({
  selected,
  onToggle,
}: {
  selected: Set<string>
  onToggle: (slug: string) => void
}) {
  return (
    <>
      {GENRE_GROUPS.map((group) => (
        <section key={group.family} className="space-y-2">
          <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
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
                  onClick={() => onToggle(genre)}
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
    </>
  )
}
