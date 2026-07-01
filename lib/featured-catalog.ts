import type { CollectionDto } from "@/types/image-collections"
import type { NewsDto } from "@/types/news"
import type { ProjectDto } from "@/types/projects"
import type { ServiceDto } from "@/types/services"
import { getServiceContent } from "@/types/services-ui"
import type { SoundDto } from "@/types/sounds"
import type { VideoDto } from "@/types/videos"
import type { WritingDto } from "@/types/writings"

export const FEATURED_CATALOG_CATEGORIES = [
  "all",
  "news",
  "projects",
  "services",
  "videos",
  "sounds",
  "collections",
  "writings",
] as const

export type FeaturedCatalogCategory = (typeof FEATURED_CATALOG_CATEGORIES)[number]

export type FeaturedCatalogStatusFilter = "all" | "featured" | "not_featured"

export type FeaturedCatalogItem = {
  key: string
  id: number
  category: Exclude<FeaturedCatalogCategory, "all">
  categoryLabel: string
  title: string
  subtitle?: string | null
  coverUrl?: string | null
  coverAspect: "square" | "book" | "wide"
  featured: boolean
  featuredOrder?: number | null
  canFeature: boolean
  detailHref: string
  editHref: string
}

export const FEATURED_CATEGORY_LABELS: Record<
  Exclude<FeaturedCatalogCategory, "all">,
  string
> = {
  news: "هەواڵەکان",
  projects: "پرۆژەکان",
  services: "خزمەتگوزارییەکان",
  videos: "ڤیدیۆکان",
  sounds: "دەنگەکان",
  collections: "کۆمەڵە وێنەکان",
  writings: "نووسراوەکان",
}

function bilingualTitle(
  ckb?: string | null,
  kmr?: string | null,
): string {
  return ckb?.trim() || kmr?.trim() || ""
}

function bilingualCover(
  ckb?: string | null,
  kmr?: string | null,
  hover?: string | null,
): string | null {
  return ckb?.trim() || kmr?.trim() || hover?.trim() || null
}

export function mapNewsToCatalogItem(news: NewsDto): FeaturedCatalogItem | null {
  if (!news.id) return null
  return {
    key: `news-${news.id}`,
    id: news.id,
    category: "news",
    categoryLabel: FEATURED_CATEGORY_LABELS.news,
    title: bilingualTitle(news.ckbContent?.title, news.kmrContent?.title),
    subtitle:
      news.category?.ckbName?.trim() ||
      news.category?.kmrName?.trim() ||
      null,
    coverUrl: news.coverUrl?.trim() || news.coverThumbnailUrl?.trim() || null,
    coverAspect: "wide",
    featured: !!news.featured,
    featuredOrder: news.featuredOrder,
    canFeature: true,
    detailHref: `/dashboard/news/${news.id}`,
    editHref: `/dashboard/news/${news.id}/edit`,
  }
}

export function mapProjectToCatalogItem(
  project: ProjectDto,
): FeaturedCatalogItem | null {
  if (!project.id) return null
  return {
    key: `projects-${project.id}`,
    id: project.id,
    category: "projects",
    categoryLabel: FEATURED_CATEGORY_LABELS.projects,
    title: bilingualTitle(
      project.ckbContent?.title,
      project.kmrContent?.title,
    ),
    subtitle:
      project.projectTypeCkb?.trim() ||
      project.projectTypeKmr?.trim() ||
      project.ckbContent?.location?.trim() ||
      null,
    coverUrl:
      project.coverUrl?.trim() ||
      project.coverThumbnailUrl?.trim() ||
      null,
    coverAspect: "wide",
    featured: !!project.featured,
    featuredOrder: project.featuredOrder,
    canFeature: true,
    detailHref: `/dashboard/projects/${project.id}`,
    editHref: `/dashboard/projects/${project.id}/edit`,
  }
}

export function mapServiceToCatalogItem(
  service: ServiceDto,
): FeaturedCatalogItem | null {
  if (!service.id) return null
  const titleCkb = getServiceContent(service, "CKB")?.title ?? ""
  const titleKmr = getServiceContent(service, "KMR")?.title ?? ""
  return {
    key: `services-${service.id}`,
    id: service.id,
    category: "services",
    categoryLabel: FEATURED_CATEGORY_LABELS.services,
    title: bilingualTitle(titleCkb, titleKmr),
    subtitle: service.serviceType?.trim() || service.location?.trim() || null,
    coverUrl: null,
    coverAspect: "square",
    featured: !!service.featured,
    featuredOrder: service.featuredOrder,
    canFeature: true,
    detailHref: `/dashboard/services/${service.id}`,
    editHref: `/dashboard/services/${service.id}/edit`,
  }
}

export function mapVideoToCatalogItem(video: VideoDto): FeaturedCatalogItem | null {
  if (!video.id) return null
  return {
    key: `videos-${video.id}`,
    id: video.id,
    category: "videos",
    categoryLabel: FEATURED_CATEGORY_LABELS.videos,
    title: bilingualTitle(video.ckbContent?.title, video.kmrContent?.title),
    subtitle:
      video.topicNameCkb?.trim() ||
      video.topicNameKmr?.trim() ||
      video.ckbContent?.director?.trim() ||
      null,
    coverUrl: bilingualCover(
      video.ckbCoverUrl,
      video.kmrCoverUrl,
      video.hoverCoverUrl,
    ),
    coverAspect: "wide",
    featured: !!video.featured,
    featuredOrder: video.featuredOrder,
    canFeature: true,
    detailHref: `/dashboard/videos/${video.id}`,
    editHref: `/dashboard/videos/${video.id}/edit`,
  }
}

export function mapSoundToCatalogItem(sound: SoundDto): FeaturedCatalogItem | null {
  if (!sound.id) return null
  return {
    key: `sounds-${sound.id}`,
    id: sound.id,
    category: "sounds",
    categoryLabel: FEATURED_CATEGORY_LABELS.sounds,
    title: bilingualTitle(sound.ckbContent?.title, sound.kmrContent?.title),
    subtitle:
      sound.topicNameCkb?.trim() ||
      sound.topicNameKmr?.trim() ||
      sound.soundType?.trim() ||
      null,
    coverUrl: bilingualCover(
      sound.ckbCoverUrl,
      sound.kmrCoverUrl,
      sound.hoverCoverUrl,
    ),
    coverAspect: "square",
    featured: !!sound.featured,
    featuredOrder: sound.featuredOrder,
    canFeature: true,
    detailHref: `/dashboard/sounds/${sound.id}`,
    editHref: `/dashboard/sounds/${sound.id}/edit`,
  }
}

export function mapCollectionToCatalogItem(
  collection: CollectionDto,
): FeaturedCatalogItem | null {
  if (!collection.id) return null
  return {
    key: `collections-${collection.id}`,
    id: collection.id,
    category: "collections",
    categoryLabel: FEATURED_CATEGORY_LABELS.collections,
    title: bilingualTitle(
      collection.ckbContent?.title,
      collection.kmrContent?.title,
    ),
    subtitle:
      collection.topicNameCkb?.trim() ||
      collection.topicNameKmr?.trim() ||
      collection.ckbContent?.location?.trim() ||
      null,
    coverUrl: bilingualCover(
      collection.ckbCoverUrl,
      collection.kmrCoverUrl,
      collection.hoverCoverUrl,
    ),
    coverAspect: "wide",
    featured: !!collection.featured,
    featuredOrder: collection.featuredOrder,
    canFeature: true,
    detailHref: `/dashboard/image-collections/${collection.id}`,
    editHref: `/dashboard/image-collections/${collection.id}/edit`,
  }
}

export function mapWritingToCatalogItem(
  writing: WritingDto,
): FeaturedCatalogItem | null {
  if (!writing.id) return null
  return {
    key: `writings-${writing.id}`,
    id: writing.id,
    category: "writings",
    categoryLabel: FEATURED_CATEGORY_LABELS.writings,
    title: bilingualTitle(writing.ckbContent?.title, writing.kmrContent?.title),
    subtitle:
      writing.ckbContent?.writer?.trim() ||
      writing.kmrContent?.writer?.trim() ||
      writing.topicNameCkb?.trim() ||
      writing.topicNameKmr?.trim() ||
      null,
    coverUrl: bilingualCover(
      writing.ckbCoverUrl,
      writing.kmrCoverUrl,
      writing.hoverCoverUrl,
    ),
    coverAspect: "book",
    featured: !!writing.featured,
    featuredOrder: writing.featuredOrder,
    canFeature: true,
    detailHref: `/dashboard/writings/${writing.id}`,
    editHref: `/dashboard/writings/${writing.id}/edit`,
  }
}

export function filterCatalogItems(
  items: FeaturedCatalogItem[],
  {
    search,
    category,
    status,
  }: {
    search: string
    category: FeaturedCatalogCategory
    status: FeaturedCatalogStatusFilter
  },
): FeaturedCatalogItem[] {
  const q = search.trim().toLowerCase()
  return items.filter((item) => {
    if (category !== "all" && item.category !== category) return false
    if (status === "featured" && !item.featured) return false
    if (status === "not_featured" && item.featured) return false
    if (!q) return true
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q)
    )
  })
}

export function countFeaturedByCategory(
  items: FeaturedCatalogItem[],
): Record<Exclude<FeaturedCatalogCategory, "all">, number> {
  const counts = {
    news: 0,
    projects: 0,
    services: 0,
    videos: 0,
    sounds: 0,
    collections: 0,
    writings: 0,
  }
  for (const item of items) {
    if (item.featured) counts[item.category] += 1
  }
  return counts
}
