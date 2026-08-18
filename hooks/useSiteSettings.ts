"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { siteSettingsKeys } from "@/lib/site-settings-query-keys"
import { getSiteSettings, updateSiteSettings } from "@/services/siteSettingsService"
import {
  DEFAULT_MAX_FEATURED_SLIDES,
  type SiteSettingsDto,
} from "@/types/site-settings"

export function useSiteSettingsQuery() {
  return useQuery({
    queryKey: siteSettingsKeys.settings(),
    queryFn: getSiteSettings,
    // Branding changes only when someone saves this screen, so it is safe to
    // hold for a while — the featured budget reads the same row.
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * The homepage carousel cap, live from the settings row.
 *
 * Falls back to the documented default while the request is in flight or if it
 * fails, so the featured screen still renders a budget rather than blanking or
 * showing a cap of zero.
 */
export function useMaxFeaturedSlides(): number {
  const { data } = useSiteSettingsQuery()
  return data?.maxFeaturedSlides ?? DEFAULT_MAX_FEATURED_SLIDES
}

export function useUpdateSiteSettingsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: (data) => {
      queryClient.setQueryData<SiteSettingsDto>(siteSettingsKeys.settings(), data)
    },
  })
}
