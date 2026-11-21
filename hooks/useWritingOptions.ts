"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  planBookGenreReorder,
  type BookGenreWritePayload,
} from "@/lib/book-genre-form-data"
import { compareBookGenres } from "@/lib/book-genre-normalize"
import { writingsKeys } from "@/lib/writings-query-keys"
import { videoKeys } from "@/lib/videos-query-keys"
import {
  createManagedOption,
  deleteManagedOption,
  getManagedOptions,
  updateManagedOption,
} from "@/services/writingOptionsService"
import type {
  ManagedOptionDto,
  ManagedOptionKind,
} from "@/types/managed-option"

export const managedOptionKeys = {
  all: (kind: ManagedOptionKind) => ["managed-options", kind] as const,
  lists: (kind: ManagedOptionKind) =>
    [...managedOptionKeys.all(kind), "list"] as const,
  list: (kind: ManagedOptionKind, includeInactive: boolean) =>
    [...managedOptionKeys.lists(kind), { includeInactive }] as const,
}

/**
 * `includeInactive` is the difference between the two callers: the management
 * screen passes `true` so hidden rows stay editable, the book form passes
 * `false` so a retired option cannot be attached to a writing.
 */
export function useManagedOptionsQuery(
  kind: ManagedOptionKind,
  includeInactive = true,
) {
  return useQuery({
    queryKey: managedOptionKeys.list(kind, includeInactive),
    queryFn: () => getManagedOptions(kind, includeInactive),
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Options are embedded in every writing response, so a rename or a delete
 * makes the cached writing lists stale as well as the option list itself.
 */
function useOptionInvalidator(kind: ManagedOptionKind) {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({
      queryKey: managedOptionKeys.lists(kind),
    })
    // Options are embedded in the records that reference them, so a rename
    // or delete makes those cached lists stale too.
    if (kind === "video-categories") {
      void queryClient.invalidateQueries({ queryKey: videoKeys.all })
    } else {
      void queryClient.invalidateQueries({ queryKey: writingsKeys.all })
    }
  }
}

export function useCreateManagedOption(kind: ManagedOptionKind) {
  const invalidate = useOptionInvalidator(kind)
  return useMutation({
    mutationFn: (payload: BookGenreWritePayload) =>
      createManagedOption(kind, payload),
    onSuccess: invalidate,
  })
}

export function useUpdateManagedOption(kind: ManagedOptionKind) {
  const invalidate = useOptionInvalidator(kind)
  return useMutation({
    mutationFn: (vars: { id: number; payload: BookGenreWritePayload }) =>
      updateManagedOption(kind, vars.id, vars.payload),
    onSuccess: invalidate,
  })
}

export function useDeleteManagedOption(kind: ManagedOptionKind) {
  const queryClient = useQueryClient()
  const invalidate = useOptionInvalidator(kind)
  return useMutation({
    mutationFn: (id: number) => deleteManagedOption(kind, id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: managedOptionKeys.lists(kind),
      })
      const snapshots = queryClient.getQueriesData<ManagedOptionDto[]>({
        queryKey: managedOptionKeys.lists(kind),
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
 * Same contract as `useReorderBookGenres`: takes the list in the order the
 * editor wants it and writes that order back, optimistic first, sequential
 * PUTs for the rows that actually moved.
 */
export function useReorderManagedOptions(kind: ManagedOptionKind) {
  const queryClient = useQueryClient()
  const invalidate = useOptionInvalidator(kind)
  return useMutation({
    mutationFn: async (ordered: ManagedOptionDto[]) => {
      for (const step of planBookGenreReorder(ordered)) {
        await updateManagedOption(kind, step.id, step.payload)
      }
    },
    onMutate: async (ordered) => {
      await queryClient.cancelQueries({
        queryKey: managedOptionKeys.lists(kind),
      })
      const snapshots = queryClient.getQueriesData<ManagedOptionDto[]>({
        queryKey: managedOptionKeys.lists(kind),
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
    onSettled: invalidate,
  })
}
