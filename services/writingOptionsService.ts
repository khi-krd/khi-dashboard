import api from "@/lib/axios"
import { unwrapApiData } from "@/lib/api-unwrap"
import type { BookGenreWritePayload } from "@/lib/book-genre-form-data"
import {
  normalizeBookGenre,
  normalizeBookGenreList,
} from "@/lib/book-genre-normalize"
import {
  MANAGED_OPTION_BASE,
  type ManagedOptionDto,
  type ManagedOptionKind,
} from "@/types/managed-option"

/**
 * CRUD for the writing vocabularies (types, editions, book languages).
 * Same contract as `bookGenreService` — the dashboard always asks for
 * `includeInactive` so hidden rows stay editable, while pickers fetch the
 * active-only list.
 */
export async function getManagedOptions(
  kind: ManagedOptionKind,
  includeInactive = true,
): Promise<ManagedOptionDto[]> {
  const { data } = await api.get<unknown>(MANAGED_OPTION_BASE[kind], {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  return normalizeBookGenreList(unwrapApiData(data))
}

export async function createManagedOption(
  kind: ManagedOptionKind,
  payload: BookGenreWritePayload,
): Promise<ManagedOptionDto | null> {
  const { data } = await api.post<unknown>(MANAGED_OPTION_BASE[kind], payload)
  return normalizeBookGenre(unwrapApiData(data))
}

/** A full replace, not a patch — send every field back, not only the changed one. */
export async function updateManagedOption(
  kind: ManagedOptionKind,
  id: number,
  payload: BookGenreWritePayload,
): Promise<ManagedOptionDto | null> {
  const { data } = await api.put<unknown>(
    `${MANAGED_OPTION_BASE[kind]}/${id}`,
    payload,
  )
  return normalizeBookGenre(unwrapApiData(data))
}

export async function deleteManagedOption(
  kind: ManagedOptionKind,
  id: number,
): Promise<void> {
  await api.delete(`${MANAGED_OPTION_BASE[kind]}/${id}`)
}
