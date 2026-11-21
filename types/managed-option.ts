import type { BookGenreDto, BookGenreRefDto } from "@/types/book-genre"

export { bookGenreLabel, suggestGenreSlug } from "@/types/book-genre"

/**
 * Editor-managed writing vocabularies — جۆری نووسین (writing types), چاپ
 * (editions) and زمانی کتێب (book languages). The API rows are field-for-field
 * identical to `BookGenreDto` (slug + bilingual names + order + active +
 * bookCount), so the genre normalizers, payload builders and reorder planner
 * are reused wholesale — this file only names the three endpoints.
 */
export type ManagedOptionKind =
  | "writing-types"
  | "editions"
  | "book-languages"
  | "video-categories"

export type ManagedOptionDto = BookGenreDto

/** An option embedded in a writing response (id + slug + names). */
export type ManagedOptionRefDto = BookGenreRefDto

export const MANAGED_OPTION_BASE: Record<ManagedOptionKind, string> = {
  "writing-types": "/api/v1/writing-types",
  editions: "/api/v1/editions",
  "book-languages": "/api/v1/book-languages",
  "video-categories": "/api/v1/video-categories",
}

export const MANAGED_OPTION_KINDS: ManagedOptionKind[] = [
  "writing-types",
  "editions",
  "book-languages",
]

/** Slug of the seeded کتێب row — the default for new writings. */
export const DEFAULT_WRITING_TYPE_SLUG = "BOOK"
/** Slug of the seeded چاپی یەکەم row — the default for new books. */
export const DEFAULT_EDITION_SLUG = "FIRST_EDITION"
