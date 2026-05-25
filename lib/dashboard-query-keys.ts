import type { DashboardModuleKey } from "@/lib/dashboard-overview"

export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: () => [...dashboardKeys.all, "overview"] as const,
  module: (key: DashboardModuleKey) =>
    [...dashboardKeys.all, "module", key] as const,
}
