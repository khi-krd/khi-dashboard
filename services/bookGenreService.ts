import api from "@/lib/axios"
import { unwrapApiData } from "@/lib/api-unwrap"
import type { BookGenreWritePayload } from "@/lib/book-genre-form-data"
import {
  normalizeBookGenre,
  normalizeBookGenreList,
} from "@/lib/book-genre-normalize"
import type { BookGenreDto } from "@/types/book-genre"

const BASE = "/api/v1/book-genres"

/**
 * The dashboard always asks for `includeInactive` so hidden rows stay editable
 * — without it a genre switched off disappears from the list and can never be
 * switched back on. The book form asks the same endpoint *without* it, so only
 * active genres can be attached to a book.
 */
export async function getBookGenres(
  includeInactive = true,
): Promise<BookGenreDto[]> {
  const { data } = await api.get<unknown>(BASE, {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  return normalizeBookGenreList(unwrapApiData(data))
}

export async function createBookGenre(
  payload: BookGenreWritePayload,
): Promise<BookGenreDto | null> {
  const { data } = await api.post<unknown>(BASE, payload)
  return normalizeBookGenre(unwrapApiData(data))
}

/** A full replace, not a patch — send every field back, not only the changed one. */
export async function updateBookGenre(
  id: number,
  payload: BookGenreWritePayload,
): Promise<BookGenreDto | null> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, payload)
  return normalizeBookGenre(unwrapApiData(data))
}

export async function deleteBookGenre(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
