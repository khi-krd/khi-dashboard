import type { BookGenre } from "@/types/writings"

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

const LITERARY: BookGenre[] = [
  "NOVEL",
  "SHORT_STORY",
  "POETRY",
  "ESSAY",
  "DRAMA",
]
const HISTORY_SOCIETY: BookGenre[] = [
  "HISTORY",
  "BIOGRAPHY",
  "POLITICAL",
  "GEOGRAPHY",
]
const KNOWLEDGE: BookGenre[] = ["ACADEMIC", "REFERENCE", "LINGUISTICS"]
const CULTURE_LIFE: BookGenre[] = [
  "RELIGIOUS",
  "FOLKLORE",
  "CHILDREN",
  "OTHER",
]

export function genreFamily(genre: BookGenre): GenreFamily {
  if (LITERARY.includes(genre)) return "literary"
  if (HISTORY_SOCIETY.includes(genre)) return "history_society"
  if (KNOWLEDGE.includes(genre)) return "knowledge"
  return "culture_life"
}

export const GENRE_GROUPS: {
  family: GenreFamily
  genres: BookGenre[]
}[] = [
  { family: "literary", genres: LITERARY },
  { family: "history_society", genres: HISTORY_SOCIETY },
  { family: "knowledge", genres: KNOWLEDGE },
  { family: "culture_life", genres: CULTURE_LIFE },
]
