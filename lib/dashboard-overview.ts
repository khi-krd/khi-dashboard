import { contactDisplayTitle } from "@/lib/contact-normalize"
import type { AboutDto, AboutPage } from "@/types/about"
import type { ContactDto, ContactPage } from "@/types/contact"
import type { CollectionDto, CollectionPage } from "@/types/image-collections"
import type { NewsDto, NewsListResponse } from "@/types/news"
import type { ProjectDto, ProjectListResponse } from "@/types/projects"
import type { ServiceDto, ServiceListResponse } from "@/types/services"
import type { SoundDto, SoundPage } from "@/types/sounds"
import type { VideoDto, VideoPage } from "@/types/videos"
import type { WritingDto, WritingPage } from "@/types/writings"

export type DashboardModuleKey =
  | "about"
  | "contact"
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

export type ModuleMeta = {
  key: DashboardModuleKey
  label: string
  href: string
  createHref: string
}

export type ModuleSummary = {
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
    createHref: "/dashboard/about",
  },
  {
    key: "contact",
    label: "پەیوەندی",
    href: "/dashboard/contact",
    createHref: "/dashboard/contact",
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

export function aboutSummary(moduleMeta: ModuleMeta, page: AboutPage): ModuleSummary {
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

export function contactSummary(
  moduleMeta: ModuleMeta,
  page: ContactPage,
): ModuleSummary {
  return {
    count: page.totalElements ?? 0,
    recentItems: mapRecentItems(moduleMeta, page.content ?? [], (item: ContactDto) => ({
      title: pickTitle(
        [contactDisplayTitle(item), item.slugCkb, item.slugKmr],
        "پەیوەندی",
      ),
      date: item.updatedAt ?? item.createdAt ?? null,
    })),
    isHealthy: true,
  }
}

export function newsSummary(
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

export function projectsSummary(
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

export function servicesSummary(
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

export function videosSummary(moduleMeta: ModuleMeta, page: VideoPage): ModuleSummary {
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

export function soundsSummary(moduleMeta: ModuleMeta, page: SoundPage): ModuleSummary {
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

export function collectionsSummary(
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

export function writingsSummary(moduleMeta: ModuleMeta, page: WritingPage): ModuleSummary {
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
