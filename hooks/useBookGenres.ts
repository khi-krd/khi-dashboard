"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  planBookGenreReorder,
  type BookGenreWritePayload,
} from "@/lib/book-genre-form-data"
import { compareBookGenres } from "@/lib/book-genre-normalize"
import { bookGenreKeys } from "@/lib/book-genre-query-keys"
import {
  createBookGenre,
  deleteBookGenre,
  getBookGenres,
  updateBookGenre,
} from "@/services/bookGenreService"
import { writingsKeys } from "@/lib/writings-query-keys"
import type { BookGenreDto } from "@/types/book-genre"

/**
 * `includeInactive` is the difference between the two callers: the genres
 * screen passes `true` so hidden rows stay editable, the book form passes
 * `false` so a retired genre cannot be attached to a new book.
 */
export function useBookGenresQuery(includeInactive = true) {
  return useQuery({
    queryKey: bookGenreKeys.list(includeInactive),
    queryFn: () => getBookGenres(includeInactive),
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Genres are embedded in every book response, so a rename or a delete makes the
 * cached book lists stale as well as the genre list itself.
 */
function useGenreInvalidator() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: bookGenreKeys.lists() })
    void queryClient.invalidateQueries({ queryKey: writingsKeys.all })
  }
}

export function useCreateBookGenre() {
  const invalidate = useGenreInvalidator()
  return useMutation({
    mutationFn: (payload: BookGenreWritePayload) => createBookGenre(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateBookGenre() {
  const invalidate = useGenreInvalidator()
  return useMutation({
    mutationFn: (vars: { id: number; payload: BookGenreWritePayload }) =>
      updateBookGenre(vars.id, vars.payload),
    onSuccess: invalidate,
  })
}

export function useDeleteBookGenre() {
  const queryClient = useQueryClient()
  const invalidate = useGenreInvalidator()
  return useMutation({
    mutationFn: (id: number) => deleteBookGenre(id),
    // Drop the row locally first — the list is a handful of items, so a full
    // refetch round-trip is more visible than the write itself.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: bookGenreKeys.lists() })
      const snapshots = queryClient.getQueriesData<BookGenreDto[]>({
        queryKey: bookGenreKeys.lists(),
      })
      for (const [key, rows] of snapshots) {
        if (!rows) continue
        queryClient.setQueryData(
          key,
          rows.filter((r) => r.id !== id),
        )
      }
      return { snapshots }
    },
    onError: (_err, _id, ctx) => {
      for (const [key, rows] of ctx?.snapshots ?? []) {
        queryClient.setQueryData(key, rows)
      }
    },
    onSuccess: invalidate,
  })
}

/**
 * Takes the list in the order the editor wants it and writes that order back.
 *
 * The arrows sit on a list the editor is reading, so the move has to land before
 * the requests do — hence the optimistic write. The book form's cached list
 * (fetched without `includeInactive`) holds a subset of these rows, so the
 * renumbered genres are patched in by id rather than replacing the array.
 */
export function useReorderBookGenres() {
  const queryClient = useQueryClient()
  const invalidate = useGenreInvalidator()
  return useMutation({
    mutationFn: async (ordered: BookGenreDto[]) => {
      // Sequential on purpose: a move renumbers a run of neighbouring rows, and
      // firing those PUTs together lets the server apply them in any order.
      for (const step of planBookGenreReorder(ordered)) {
        await updateBookGenre(step.id, step.payload)
      }
    },
    onMutate: async (ordered) => {
      await queryClient.cancelQueries({ queryKey: bookGenreKeys.lists() })
      const snapshots = queryClient.getQueriesData<BookGenreDto[]>({
        queryKey: bookGenreKeys.lists(),
      })
      const renumbered = new Map(
        ordered.flatMap((row, index) =>
          row.id == null ? [] : [[row.id, { ...row, displayOrder: index }]],
        ),
      )
      for (const [key, rows] of snapshots) {
        if (!rows) continue
        queryClient.setQueryData(
          key,
          rows
            .map((r) => (r.id != null ? (renumbered.get(r.id) ?? r) : r))
            .sort(compareBookGenres),
        )
      }
      return { snapshots }
    },
    onError: (_err, _ordered, ctx) => {
      for (const [key, rows] of ctx?.snapshots ?? []) {
        queryClient.setQueryData(key, rows)
      }
    },
    // Always refetch, success or not: a run that failed halfway has written some
    // of its rows, so the cache is only trustworthy once the server has spoken.
    onSettled: invalidate,
  })
}
