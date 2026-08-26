"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { SocialLinkWritePayload } from "@/lib/social-links-form-data"
import { socialLinksKeys } from "@/lib/social-links-query-keys"
import {
  createSocialLink,
  deleteSocialLink,
  getSocialLinks,
  updateSocialLink,
} from "@/services/socialLinksService"
import type { SocialLinkDto } from "@/types/social-links"

export function useSocialLinksQuery(includeInactive = true) {
  return useQuery({
    queryKey: socialLinksKeys.list(includeInactive),
    queryFn: () => getSocialLinks(includeInactive),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateSocialLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SocialLinkWritePayload) => createSocialLink(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialLinksKeys.lists() })
    },
  })
}

export function useUpdateSocialLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: number; payload: SocialLinkWritePayload }) =>
      updateSocialLink(vars.id, vars.payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialLinksKeys.lists() })
    },
  })
}

export function useDeleteSocialLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteSocialLink(id),
    // Drop the row locally first — the list is a handful of items, so a full
    // refetch round-trip is more visible than the write itself.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: socialLinksKeys.lists() })
      const snapshots = queryClient.getQueriesData<SocialLinkDto[]>({
        queryKey: socialLinksKeys.lists(),
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
      void queryClient.invalidateQueries({ queryKey: socialLinksKeys.lists() })
    },
  })
}
