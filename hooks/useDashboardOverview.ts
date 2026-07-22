"use client"

import { useMemo } from "react"
import { useQueries, useQueryClient } from "@tanstack/react-query"

import { getAboutList } from "@/services/aboutService"
import { getContactListAdmin } from "@/services/contactService"
import { getCollectionsList } from "@/services/imageCollectionsService"
import { getNewsList } from "@/services/newsService"
import { getProjectsList } from "@/services/projectsService"
import { getServicesList } from "@/services/servicesService"
import { getSoundsList } from "@/services/soundsService"
import { getVideosList } from "@/services/videosService"
import { getWritingsList } from "@/services/writingsService"
import { dashboardKeys } from "@/lib/dashboard-query-keys"
import {
  DASHBOARD_MODULE_META,
  DASHBOARD_QUICK_ACTIONS,
  aboutSummary,
  contactSummary,
  collectionsSummary,
  newsSummary,
  projectsSummary,
  servicesSummary,
  soundsSummary,
  videosSummary,
  writingsSummary,
  type DashboardModuleCard,
  type DashboardModuleKey,
  type DashboardRecentItem,
  type ModuleMeta,
  type ModuleSummary,
} from "@/lib/dashboard-overview"

const PAGE_SIZE = 5

const META_BY_KEY = new Map<DashboardModuleKey, ModuleMeta>(
  DASHBOARD_MODULE_META.map((meta) => [meta.key, meta]),
)

/**
 * Each module is fetched as its own query so a single slow endpoint can no
 * longer block the whole page — cards stream in as their data arrives.
 */
type ModuleQueryConfig = {
  key: DashboardModuleKey
  queryFn: () => Promise<unknown>
  summarize: (meta: ModuleMeta, data: never) => ModuleSummary
}

const MODULE_QUERIES: ModuleQueryConfig[] = [
  { key: "about", queryFn: () => getAboutList(0, PAGE_SIZE), summarize: aboutSummary as never },
  { key: "contact", queryFn: () => getContactListAdmin(0, PAGE_SIZE), summarize: contactSummary as never },
  { key: "news", queryFn: () => getNewsList(0, PAGE_SIZE), summarize: newsSummary as never },
  { key: "projects", queryFn: () => getProjectsList(0, PAGE_SIZE), summarize: projectsSummary as never },
  { key: "services", queryFn: () => getServicesList(0, PAGE_SIZE), summarize: servicesSummary as never },
  { key: "videos", queryFn: () => getVideosList({ page: 0, size: PAGE_SIZE }), summarize: videosSummary as never },
  { key: "sounds", queryFn: () => getSoundsList(0, PAGE_SIZE), summarize: soundsSummary as never },
  { key: "collections", queryFn: () => getCollectionsList(0, PAGE_SIZE), summarize: collectionsSummary as never },
  { key: "writings", queryFn: () => getWritingsList(0, PAGE_SIZE), summarize: writingsSummary as never },
]

export type DashboardModuleState = {
  card: DashboardModuleCard
  recentItems: DashboardRecentItem[]
  isLoading: boolean
  isError: boolean
}

export type DashboardOverview = {
  modules: DashboardModuleState[]
  quickActions: typeof DASHBOARD_QUICK_ACTIONS
  recentItems: DashboardRecentItem[]
  totalCount: number
  healthyCount: number
  loadedCount: number
  moduleCount: number
  failedLabels: string[]
  isInitialLoading: boolean
  isFetching: boolean
  isAllError: boolean
  generatedAt: string | null
  refetch: () => void
}

export function useDashboardOverview(): DashboardOverview {
  const queryClient = useQueryClient()

  const queries = useQueries({
    queries: MODULE_QUERIES.map((config) => ({
      queryKey: dashboardKeys.module(config.key),
      queryFn: config.queryFn,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      retry: 1,
    })),
  })

  return useMemo<DashboardOverview>(() => {
    const modules: DashboardModuleState[] = MODULE_QUERIES.map((config, index) => {
      const query = queries[index]
      const meta = META_BY_KEY.get(config.key)!
      const summary =
        query.data !== undefined
          ? config.summarize(meta, query.data as never)
          : null

      const card: DashboardModuleCard = {
        key: meta.key,
        label: meta.label,
        href: meta.href,
        createHref: meta.createHref,
        count: summary?.count ?? 0,
        isHealthy: query.isError ? false : (summary?.isHealthy ?? true),
      }

      return {
        card,
        recentItems: summary?.recentItems ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
      }
    })

    const loaded = modules.filter((m) => !m.isLoading)
    const recentItems = modules
      .flatMap((m) => m.recentItems)
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
      .slice(0, 12)

    const totalCount = loaded.reduce((sum, m) => sum + m.card.count, 0)
    const healthyCount = loaded.filter((m) => m.card.isHealthy).length
    const failedLabels = modules
      .filter((m) => m.isError)
      .map((m) => m.card.label)

    return {
      modules,
      quickActions: DASHBOARD_QUICK_ACTIONS,
      recentItems,
      totalCount,
      healthyCount,
      loadedCount: loaded.length,
      moduleCount: modules.length,
      failedLabels,
      isInitialLoading: queries.every((q) => q.isLoading),
      isFetching: queries.some((q) => q.isFetching),
      isAllError: queries.every((q) => q.isError),
      generatedAt: loaded.length > 0 ? new Date().toISOString() : null,
      refetch: () => {
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      },
    }
  }, [queries, queryClient])
}
