import { z } from "zod"

import {
  BOOK_GENRE_NAME_MAX,
  BOOK_GENRE_SLUG_MAX,
  type BookGenreDto,
} from "@/types/book-genre"

// Every field is optional by design: the schema never blocks a blank. Format
// and length rules fire on what was typed, never on what was left empty. The
// two things the backend genuinely rejects — a genre with no name at all, and a
// genre with no slug — are checked at submit time in the dialog instead, so the
// editor gets a sentence rather than a 400.
export const bookGenreSchema = z.object({
  slug: z
    .string()
    .trim()
    .max(BOOK_GENRE_SLUG_MAX)
    // Upper-cased on save by the server; the same rule is applied client-side so
    // what the editor typed matches what comes back.
    .refine((v) => v === "" || /^[a-z0-9][a-z0-9_]*$/i.test(v), {
      message: "slug_format",
    }),
  nameCkb: z.string().max(BOOK_GENRE_NAME_MAX).optional().nullable(),
  nameKmr: z.string().max(BOOK_GENRE_NAME_MAX).optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
})

export type BookGenreFormValues = z.infer<typeof bookGenreSchema>

export function defaultBookGenreValues(displayOrder = 0): BookGenreFormValues {
  return {
    slug: "",
    nameCkb: "",
    nameKmr: "",
    displayOrder,
    active: true,
  }
}

/**
 * Optional fields come back absent rather than null, so each one is coalesced to
 * `""` — binding `undefined` to an input makes it uncontrolled.
 */
export function bookGenreDtoToFormValues(
  dto: BookGenreDto,
): BookGenreFormValues {
  return {
    slug: dto.slug ?? "",
    nameCkb: dto.nameCkb ?? "",
    nameKmr: dto.nameKmr ?? "",
    displayOrder: dto.displayOrder ?? 0,
    active: dto.active,
  }
}
