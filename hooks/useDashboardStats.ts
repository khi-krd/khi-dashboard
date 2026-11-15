"use client"

import { useQuery } from "@tanstack/react-query"

import { classifyApiError } from "@/lib/api-error"
import { getDashboardStats } from "@/services/dashboardStatsService"
import type { DashboardStats } from "@/types/dashboard-stats"

export const dashboardStatsKeys = {
  all: ["dashboard", "stats"] as const,
}

/**
 * Aggregated content statistics — admin-only endpoint. A 403 (employee role)
 * simply yields no data; the section hides itself instead of erroring.
 */
export function useDashboardStats() {
  return useQuery<DashboardStats | null>({
    queryKey: dashboardStatsKeys.all,
    queryFn: async () => {
      try {
        const resp = await getDashboardStats()
        return resp.success && resp.data ? resp.data : null
      } catch (err) {
        if (classifyApiError(err).status === 403) return null
        throw err
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
