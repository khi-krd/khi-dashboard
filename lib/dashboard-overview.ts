import type { AboutDto, AboutPage } from "@/types/about"
import type { CollectionDto, CollectionPage } from "@/types/image-collections"
import type { NewsDto, NewsListResponse } from "@/types/news"
import type { ProjectDto, ProjectListResponse } from "@/types/projects"
import type { ServiceDto, ServiceListResponse } from "@/types/services"
import type { SoundDto, SoundPage } from "@/types/sounds"
import type { VideoDto, VideoPage } from "@/types/videos"
import type { WritingDto, WritingPage } from "@/types/writings"

export type DashboardModuleKey =
  | "about"
  | "news"
  | "projects"
  | "services"
  | "videos"
  | "sounds"
  | "collections"
  | "writings"

export type DashboardModuleCard = {
  key: DashboardModuleKey
  label: string
  href: string
  createHref: string
  count: number
  isHealthy: boolean
}

export type DashboardQuickAction = {
  key: string
  label: string
  href: string
}

export type DashboardRecentItem = {
  key: string
  moduleKey: DashboardModuleKey
  moduleLabel: string
  title: string
  href: string
  date: string | null
}

export type DashboardOverviewData = {
  cards: DashboardModuleCard[]
  quickActions: DashboardQuickAction[]
  recentItems: DashboardRecentItem[]
  totalCount: number
  healthyCount: number
  failedModules: DashboardModuleKey[]
  generatedAt: string
}

type ModuleMeta = {
  key: DashboardModuleKey
  label: string
  href: string
  createHref: string
}

type ModuleSummary = {
  count: number
  recentItems: DashboardRecentItem[]
  isHealthy: boolean
}

const RECENT_PER_MODULE = 3

export const DASHBOARD_MODULE_META: readonly ModuleMeta[] = [
  {
    key: "about",
    label: "دەربارە",
    href: "/dashboard/about",
    createHref: "/dashboard/about/new",
  },
  {
    key: "news",
    label: "هەواڵەکان",
    href: "/dashboard/news",
    createHref: "/dashboard/news/new",
  },
  {
    key: "projects",
    label: "پرۆژەکان",
    href: "/dashboard/projects",
    createHref: "/dashboard/projects/new",
  },
  {
    key: "services",
    label: "خزمەتگوزارییەکان",
    href: "/dashboard/services",
    createHref: "/dashboard/services/new",
  },
  {
    key: "videos",
    label: "ڤیدیۆکان",
    href: "/dashboard/videos",
    createHref: "/dashboard/videos/new",
  },
  {
    key: "sounds",
    label: "دەنگەکان",
    href: "/dashboard/sounds",
    createHref: "/dashboard/sounds/new",
  },
  {
    key: "collections",
    label: "کۆمەڵە وێنەکان",
    href: "/dashboard/image-collections",
    createHref: "/dashboard/image-collections/new",
  },
  {
    key: "writings",
    label: "نووسراوەکان",
    href: "/dashboard/writings",
    createHref: "/dashboard/writings/new",
  },
] as const

export const DASHBOARD_QUICK_ACTIONS: readonly DashboardQuickAction[] = [
  ...DASHBOARD_MODULE_META.map((item) => ({
    key: item.key,
    label: `زیادکردنی ${item.label}`,
    href: item.createHref,
  })),
  { key: "contact", label: "پەڕەی پەیوەندی", href: "/dashboard/contact" },
] as const

function pickTitle(values: Array<string | null | undefined>, fallback: string) {
  for (const value of values) {
    if (value?.trim()) return value.trim()
  }
  return fallback
}

function mapRecentItems<T extends { id?: number }>(
  moduleMeta: ModuleMeta,
  items: T[],
  resolver: (item: T) => { title: string; date: string | null },
): DashboardRecentItem[] {
  return items.slice(0, RECENT_PER_MODULE).map((item, index) => {
    const resolved = resolver(item)
    const id = item.id
    const href = typeof id === "number" ? `${moduleMeta.href}/${id}` : moduleMeta.href
    return {
      key: `${moduleMeta.key}-${id ?? index}`,
      moduleKey: moduleMeta.key,
      moduleLabel: moduleMeta.label,
      title: resolved.title,
      href,
      date: resolved.date,
    }
  })
}

function aboutSummary(moduleMeta: ModuleMeta, page: AboutPage): ModuleSummary {
  return {
    count: page.totalElements ?? 0,
    recentItems: mapRecentItems(moduleMeta, page.content ?? [], (item: AboutDto) => ({
      title: pickTitle(
        [item.ckbContent?.title, item.kmrContent?.title, item.slugCkb, item.slugKmr],
        "دەربارە",
      ),
      date: item.updatedAt ?? item.createdAt ?? null,
    })),
    isHealthy: true,
  }
}

function newsSummary(
  moduleMeta: ModuleMeta,
  response: NewsListResponse,
): ModuleSummary {
  const content = response.data?.content ?? []
  return {
    count: response.data?.totalElements ?? 0,
    recentItems: mapRecentItems(moduleMeta, content, (item: NewsDto) => ({
      title: pickTitle(
        [item.ckbContent?.title, item.kmrContent?.title],
        "هەواڵ",
      ),
      date: item.updatedAt ?? item.createdAt ?? item.datePublished ?? null,
    })),
    isHealthy: response.success,
  }
}

function projectsSummary(
  moduleMeta: ModuleMeta,
  response: ProjectListResponse,
): ModuleSummary {
  const content = response.data?.content ?? []
  return {
    count: response.data?.totalElements ?? 0,
    recentItems: mapRecentItems(moduleMeta, content, (item: ProjectDto) => ({
      title: pickTitle(
        [item.ckbContent?.title, item.kmrContent?.title],
        "پرۆژە",
      ),
      date: item.updatedAt ?? item.createdAt ?? item.projectDate ?? null,
    })),
    isHealthy: response.success,
  }
}

function servicesSummary(
  moduleMeta: ModuleMeta,
  response: ServiceListResponse,
): ModuleSummary {
  const content = response.data?.content ?? []
  return {
    count: response.data?.totalElements ?? 0,
    recentItems: mapRecentItems(moduleMeta, content, (item: ServiceDto) => ({
      title: pickTitle(
        item.contents.map((c) => c.title),
        item.serviceType || "خزمەتگوزاری",
      ),
      date: item.updatedAt ?? item.createdAt ?? item.publishedAt ?? null,
    })),
    isHealthy: response.success,
  }
}

function videosSummary(moduleMeta: ModuleMeta, page: VideoPage): ModuleSummary {
  return {
    count: page.totalElements ?? 0,
    recentItems: mapRecentItems(moduleMeta, page.content ?? [], (item: VideoDto) => ({
      title: pickTitle(
        [item.ckbContent?.title, item.kmrContent?.title],
        "ڤیدیۆ",
      ),
      date: item.updatedAt ?? item.createdAt ?? item.publishmentDate ?? null,
    })),
    isHealthy: true,
  }
}

function soundsSummary(moduleMeta: ModuleMeta, page: SoundPage): ModuleSummary {
  return {
    count: page.totalElements ?? 0,
    recentItems: mapRecentItems(moduleMeta, page.content ?? [], (item: SoundDto) => ({
      title: pickTitle(
        [item.ckbContent?.title, item.kmrContent?.title],
        "دەنگ",
      ),
      date: item.updatedAt ?? item.createdAt ?? null,
    })),
    isHealthy: true,
  }
}

function collectionsSummary(
  moduleMeta: ModuleMeta,
  page: CollectionPage,
): ModuleSummary {
  return {
    count: page.totalElements ?? 0,
    recentItems: mapRecentItems(
      moduleMeta,
      page.content ?? [],
      (item: CollectionDto) => ({
        title: pickTitle(
          [item.ckbContent?.title, item.kmrContent?.title],
          "کۆمەڵە وێنە",
        ),
        date: item.updatedAt ?? item.createdAt ?? item.publishmentDate ?? null,
      }),
    ),
    isHealthy: true,
  }
}

function writingsSummary(moduleMeta: ModuleMeta, page: WritingPage): ModuleSummary {
  return {
    count: page.totalElements ?? 0,
    recentItems: mapRecentItems(moduleMeta, page.content ?? [], (item: WritingDto) => ({
      title: pickTitle(
        [item.ckbContent?.title, item.kmrContent?.title],
        "نووسراوە",
      ),
      date: item.updatedAt ?? item.createdAt ?? null,
    })),
    isHealthy: true,
  }
}

export function buildDashboardOverviewData(input: {
  about: AboutPage
  news: NewsListResponse
  projects: ProjectListResponse
  services: ServiceListResponse
  videos: VideoPage
  sounds: SoundPage
  collections: CollectionPage
  writings: WritingPage
  forceFailed?: DashboardModuleKey[]
}): DashboardOverviewData {
  const byKey = new Map(DASHBOARD_MODULE_META.map((item) => [item.key, item]))

  const summaries = {
    about: aboutSummary(byKey.get("about")!, input.about),
    news: newsSummary(byKey.get("news")!, input.news),
    projects: projectsSummary(byKey.get("projects")!, input.projects),
    services: servicesSummary(byKey.get("services")!, input.services),
    videos: videosSummary(byKey.get("videos")!, input.videos),
    sounds: soundsSummary(byKey.get("sounds")!, input.sounds),
    collections: collectionsSummary(byKey.get("collections")!, input.collections),
    writings: writingsSummary(byKey.get("writings")!, input.writings),
  } satisfies Record<DashboardModuleKey, ModuleSummary>

  const forcedFailedSet = new Set(input.forceFailed ?? [])
  const cards: DashboardModuleCard[] = DASHBOARD_MODULE_META.map((meta) => {
    const baseHealthy = summaries[meta.key].isHealthy
    return {
      key: meta.key,
      label: meta.label,
      href: meta.href,
      createHref: meta.createHref,
      count: summaries[meta.key].count,
      isHealthy: baseHealthy && !forcedFailedSet.has(meta.key),
    }
  })

  const recentItems = DASHBOARD_MODULE_META.flatMap(
    (meta) => summaries[meta.key].recentItems,
  )
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, 12)

  const totalCount = cards.reduce((sum, card) => sum + card.count, 0)
  const healthyCount = cards.filter((card) => card.isHealthy).length
  const failedModules = cards
    .filter((card) => !card.isHealthy)
    .map((card) => card.key)

  return {
    cards,
    quickActions: [...DASHBOARD_QUICK_ACTIONS],
    recentItems,
    totalCount,
    healthyCount,
    failedModules,
    generatedAt: new Date().toISOString(),
  }
}
