import type { KnownBookGenre } from "@/types/writings"

export type GenreFamily =
  | "literary"
  | "history_society"
  | "knowledge"
  | "culture_life"

export const GENRE_FAMILY_CLASSES: Record<
  GenreFamily,
  { pill: string; selected: string }
> = {
  literary: {
    pill: "bg-primary/10 text-primary border-primary/20",
    selected: "bg-primary text-primary-foreground border-primary",
  },
  history_society: {
    pill: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
    selected:
      "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500",
  },
  knowledge: {
    pill: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
    selected:
      "bg-purple-600 text-white border-purple-600 dark:bg-purple-500 dark:border-purple-500",
  },
  culture_life: {
    pill: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
    selected:
      "bg-amber-600 text-white border-amber-600 dark:bg-amber-500 dark:border-amber-500",
  },
}

const LITERARY: KnownBookGenre[] = [
  "NOVEL",
  "SHORT_STORY",
  "POETRY",
  "ESSAY",
  "DRAMA",
]
const HISTORY_SOCIETY: KnownBookGenre[] = [
  "HISTORY",
  "BIOGRAPHY",
  "POLITICAL",
  "GEOGRAPHY",
]
const KNOWLEDGE: KnownBookGenre[] = ["ACADEMIC", "REFERENCE", "LINGUISTICS"]
const CULTURE_LIFE: KnownBookGenre[] = [
  "RELIGIOUS",
  "FOLKLORE",
  "CHILDREN",
  "OTHER",
]

/**
 * Any slug is accepted — a genre created from the dashboard belongs to no
 * built-in family, and falls through to the same default `OTHER` always had
 * rather than leaving the pill unstyled.
 */
export function genreFamily(genre: string): GenreFamily {
  const key = genre as KnownBookGenre
  if (LITERARY.includes(key)) return "literary"
  if (HISTORY_SOCIETY.includes(key)) return "history_society"
  if (KNOWLEDGE.includes(key)) return "knowledge"
  return "culture_life"
}

/** The built-in genres, grouped. Used as the fallback picker and the filters. */
export const GENRE_GROUPS: {
  family: GenreFamily
  genres: KnownBookGenre[]
}[] = [
  { family: "literary", genres: LITERARY },
  { family: "history_society", genres: HISTORY_SOCIETY },
  { family: "knowledge", genres: KNOWLEDGE },
  { family: "culture_life", genres: CULTURE_LIFE },
]
