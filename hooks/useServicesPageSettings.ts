"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getServicesPageSettings,
  updateServicesPageSettings,
} from "@/services/servicesPageService"
import type { ServicesPageSettingsDto } from "@/types/services-page"

export const servicesPageSettingsKey = ["services", "page-settings"] as const

export function useServicesPageSettingsQuery() {
  return useQuery({
    queryKey: servicesPageSettingsKey,
    queryFn: getServicesPageSettings,
    staleTime: 1000 * 60 * 2,
    retry: false,
  })
}

export function useUpdateServicesPageSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ServicesPageSettingsDto) =>
      updateServicesPageSettings(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.setQueryData(servicesPageSettingsKey, res)
      }
    },
  })
}
