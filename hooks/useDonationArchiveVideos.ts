"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  planDonationArchiveVideoReorder,
  type DonationArchiveVideoWritePayload,
} from "@/lib/donation-archive-video-form-data"
import { compareDonationArchiveVideos } from "@/lib/donation-archive-video-normalize"
import { donationArchiveVideoKeys } from "@/lib/donation-archive-video-query-keys"
import {
  createDonationArchiveVideo,
  deleteDonationArchiveVideo,
  getDonationArchiveVideos,
  updateDonationArchiveVideo,
} from "@/services/donationArchiveVideoService"
import type { DonationArchiveVideoDto } from "@/types/donation-archive-video"

export function useDonationArchiveVideosQuery(includeInactive = true) {
  return useQuery({
    queryKey: donationArchiveVideoKeys.list(includeInactive),
    queryFn: () => getDonationArchiveVideos(includeInactive),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateDonationArchiveVideo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: DonationArchiveVideoWritePayload) =>
      createDonationArchiveVideo(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: donationArchiveVideoKeys.lists(),
      })
    },
  })
}

export function useUpdateDonationArchiveVideo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      id: number
      payload: DonationArchiveVideoWritePayload
    }) => updateDonationArchiveVideo(vars.id, vars.payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: donationArchiveVideoKeys.lists(),
      })
    },
  })
}

export function useDeleteDonationArchiveVideo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteDonationArchiveVideo(id),
    // Drop the row locally first — the list is a handful of videos, so a full
    // refetch round-trip is more visible than the write itself.
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: donationArchiveVideoKeys.lists(),
      })
      const snapshots = queryClient.getQueriesData<DonationArchiveVideoDto[]>({
        queryKey: donationArchiveVideoKeys.lists(),
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
        queryKey: donationArchiveVideoKeys.lists(),
      })
    },
  })
}

/**
 * Takes the list in the order the editor wants it and writes that order back.
 *
 * The arrows sit on a list the editor is reading, so the move has to land before
 * the requests do — hence the optimistic write. A cached list fetched without
 * `includeInactive` holds a subset of these rows, so the renumbered videos are
 * patched in by id rather than replacing the array wholesale.
 */
export function useReorderDonationArchiveVideos() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ordered: DonationArchiveVideoDto[]) => {
      // Sequential on purpose: a move renumbers a run of neighbouring rows, and
      // firing those PUTs together lets the server apply them in any order.
      for (const step of planDonationArchiveVideoReorder(ordered)) {
        await updateDonationArchiveVideo(step.id, step.payload)
      }
    },
    onMutate: async (ordered) => {
      await queryClient.cancelQueries({
        queryKey: donationArchiveVideoKeys.lists(),
      })
      const snapshots = queryClient.getQueriesData<DonationArchiveVideoDto[]>({
        queryKey: donationArchiveVideoKeys.lists(),
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
            .sort(compareDonationArchiveVideos),
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
        queryKey: donationArchiveVideoKeys.lists(),
      })
    },
  })
}
