"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  planDonationTypeCardReorder,
  type DonationTypeCardWritePayload,
} from "@/lib/donation-type-card-form-data"
import { compareDonationTypeCards } from "@/lib/donation-type-card-normalize"
import { donationTypeCardKeys } from "@/lib/donation-type-card-query-keys"
import {
  createDonationTypeCard,
  deleteDonationTypeCard,
  getDonationTypeCards,
  updateDonationTypeCard,
} from "@/services/donationTypeCardService"
import type { DonationTypeCardDto } from "@/types/donation-type-card"

export function useDonationTypeCardsQuery(includeInactive = true) {
  return useQuery({
    queryKey: donationTypeCardKeys.list(includeInactive),
    queryFn: () => getDonationTypeCards(includeInactive),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateDonationTypeCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: DonationTypeCardWritePayload) =>
      createDonationTypeCard(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: donationTypeCardKeys.lists(),
      })
    },
  })
}

export function useUpdateDonationTypeCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: number; payload: DonationTypeCardWritePayload }) =>
      updateDonationTypeCard(vars.id, vars.payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: donationTypeCardKeys.lists(),
      })
    },
  })
}

export function useDeleteDonationTypeCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteDonationTypeCard(id),
    // Drop the row locally first — the rail is a handful of cards, so a full
    // refetch round-trip is more visible than the write itself.
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: donationTypeCardKeys.lists(),
      })
      const snapshots = queryClient.getQueriesData<DonationTypeCardDto[]>({
        queryKey: donationTypeCardKeys.lists(),
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
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: donationTypeCardKeys.lists(),
      })
    },
  })
}

/**
 * Takes the rail in the order the editor wants it and writes that order back.
 *
 * The arrows sit on a list the editor is reading, so the move has to land before
 * the requests do — hence the optimistic write. A cached list fetched without
 * `includeInactive` holds a subset of these rows, so the renumbered cards are
 * patched in by id rather than replacing the array wholesale.
 */
export function useReorderDonationTypeCards() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ordered: DonationTypeCardDto[]) => {
      // Sequential on purpose: a move renumbers a run of neighbouring rows, and
      // firing those PUTs together lets the server apply them in any order.
      for (const step of planDonationTypeCardReorder(ordered)) {
        await updateDonationTypeCard(step.id, step.payload)
      }
    },
    onMutate: async (ordered) => {
      await queryClient.cancelQueries({
        queryKey: donationTypeCardKeys.lists(),
      })
      const snapshots = queryClient.getQueriesData<DonationTypeCardDto[]>({
        queryKey: donationTypeCardKeys.lists(),
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
            .sort(compareDonationTypeCards),
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
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: donationTypeCardKeys.lists(),
      })
    },
  })
}
