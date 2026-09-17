"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { siteSettingsKeys } from "@/lib/site-settings-query-keys"
import {
  createSiteFont,
  deleteSiteFont,
  getSiteFonts,
} from "@/services/siteFontService"
import type { SiteFontDto, SiteFontPayload } from "@/types/site-fonts"

export const siteFontKeys = {
  all: ["site-fonts"] as const,
  list: () => [...siteFontKeys.all, "list"] as const,
}

/** The typeface library — every uploaded font, both languages. */
export function useSiteFontsQuery() {
  return useQuery({
    queryKey: siteFontKeys.list(),
    queryFn: getSiteFonts,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateSiteFontMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SiteFontPayload) => createSiteFont(payload),
    onSuccess: (font) => {
      queryClient.setQueryData<SiteFontDto[]>(siteFontKeys.list(), (old) => [
        ...(old ?? []),
        font,
      ])
    },
  })
}

export function useDeleteSiteFontMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteSiteFont(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<SiteFontDto[]>(siteFontKeys.list(), (old) =>
        (old ?? []).filter((f) => f.id !== id),
      )
      // Deleting the live font clears it in site_settings server-side, so the
      // settings snapshot has to refresh too.
      void queryClient.invalidateQueries({ queryKey: siteSettingsKeys.all })
    },
  })
}
