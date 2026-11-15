import api from "@/lib/axios"
import type { DashboardStats, StatsApiResponse } from "@/types/dashboard-stats"

const BASE = "/api/v1/dashboard"

export async function getDashboardStats(): Promise<StatsApiResponse<DashboardStats>> {
  const { data } = await api.get<StatsApiResponse<DashboardStats>>(`${BASE}/stats`)
  return data
}
