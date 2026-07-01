import { unwrapApiData } from "@/lib/api-unwrap"
import { normalizeCollectionDto, normalizeCollectionPage } from "@/lib/image-collections-normalize"
import { normalizeNewsDto } from "@/lib/news-media-normalize"
import { normalizeProjectDto } from "@/lib/projects-media-normalize"
import { normalizeServiceDto } from "@/lib/services-media-normalize"
import { normalizeSoundDto, normalizeSoundPage } from "@/lib/sounds-normalize"
import { normalizeVideoDto, normalizeVideoPage } from "@/lib/videos-normalize"
import { normalizeWritingDto, normalizeWritingPage } from "@/lib/writings-normalize"
import type { CollectionDto, CollectionPage } from "@/types/image-collections"
import type { NewsDto, PageResponse } from "@/types/news"
import type { ProjectDto, PageResponse as ProjectPageResponse } from "@/types/projects"
import type { ServiceDto, PageResponse as ServicePageResponse } from "@/types/services"
import type { SoundDto, SoundPage } from "@/types/sounds"
import type { VideoDto, VideoPage } from "@/types/videos"
import type { WritingDto, WritingPage } from "@/types/writings"

function normalizeFeaturedArray<T>(
  raw: unknown,
  mapItem: (item: unknown) => T,
): T[] {
  const unwrapped = unwrapApiData<unknown>(raw)
  if (Array.isArray(unwrapped)) {
    return unwrapped.map(mapItem)
  }
  if (unwrapped && typeof unwrapped === "object") {
    const content = (unwrapped as { content?: unknown }).content
    if (Array.isArray(content)) {
      return content.map(mapItem)
    }
  }
  return []
}

function fallbackPage<T>(
  content: T[],
  page: number,
  size: number,
): {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
} {
  return {
    content,
    totalElements: content.length,
    totalPages: Math.max(1, Math.ceil(content.length / size)),
    size,
    number: page,
    first: page === 0,
    last: content.length <= size,
    empty: content.length === 0,
  }
}

function normalizeFeaturedWrappedPage<TDto>(
  raw: unknown,
  page: number,
  size: number,
  normalizeItem: (item: TDto) => TDto,
): PageResponse<TDto> {
  const unwrapped = unwrapApiData<PageResponse<TDto>>(raw)
  if (unwrapped?.content) {
    return {
      ...unwrapped,
      content: unwrapped.content.map(normalizeItem),
    }
  }
  const content = normalizeFeaturedArray(raw, (item) =>
    normalizeItem(item as TDto),
  )
  return fallbackPage(content, page, size)
}

export function normalizeFeaturedNewsPage(
  raw: unknown,
  page: number,
  size: number,
): PageResponse<NewsDto> {
  return normalizeFeaturedWrappedPage(raw, page, size, normalizeNewsDto)
}

export function normalizeFeaturedProjectPage(
  raw: unknown,
  page: number,
  size: number,
): ProjectPageResponse<ProjectDto> {
  return normalizeFeaturedWrappedPage(raw, page, size, normalizeProjectDto)
}

export function normalizeFeaturedServicePage(
  raw: unknown,
  page: number,
  size: number,
): ServicePageResponse<ServiceDto> {
  return normalizeFeaturedWrappedPage(raw, page, size, normalizeServiceDto)
}

export function normalizeFeaturedVideoPage(
  raw: unknown,
  page: number,
  size: number,
): VideoPage {
  try {
    return normalizeVideoPage(unwrapApiData(raw))
  } catch {
    const content = normalizeFeaturedArray(raw, normalizeVideoDto)
    return fallbackPage(content, page, size)
  }
}

export function normalizeFeaturedCollectionPage(
  raw: unknown,
  page: number,
  size: number,
): CollectionPage {
  try {
    return normalizeCollectionPage(raw)
  } catch {
    const content = normalizeFeaturedArray(raw, normalizeCollectionDto)
    return fallbackPage(content, page, size)
  }
}

export function normalizeFeaturedSoundPage(
  raw: unknown,
  page: number,
  size: number,
): SoundPage {
  try {
    return normalizeSoundPage(raw)
  } catch {
    const content = normalizeFeaturedArray(raw, normalizeSoundDto)
    return fallbackPage(content, page, size)
  }
}

export function normalizeFeaturedWritingPage(
  raw: unknown,
  page: number,
  size: number,
): WritingPage {
  try {
    return normalizeWritingPage(raw)
  } catch {
    const content = normalizeFeaturedArray(raw, normalizeWritingDto)
    return fallbackPage(content, page, size)
  }
}

export type FeaturedOverlayEntry = {
  featured: boolean
  featuredOrder: number | null
}

type FeaturedSource = {
  keyPrefix: string
  items: Array<{ id?: number; featured?: boolean; featuredOrder?: number | null }>
}

function applyFeaturedSources(
  map: Map<string, FeaturedOverlayEntry>,
  sources: FeaturedSource[],
) {
  for (const source of sources) {
    for (const item of source.items) {
      if (!item.id || !item.featured) continue
      map.set(`${source.keyPrefix}-${item.id}`, {
        featured: true,
        featuredOrder: item.featuredOrder ?? null,
      })
    }
  }
}

export function buildFeaturedOverlay(
  entries: FeaturedSource[],
): Map<string, FeaturedOverlayEntry> {
  const map = new Map<string, FeaturedOverlayEntry>()
  applyFeaturedSources(map, entries)
  return map
}

export function applyFeaturedOverlay<
  T extends { key: string; featured: boolean; featuredOrder?: number | null },
>(items: T[], overlay: Map<string, FeaturedOverlayEntry>): T[] {
  return items.map((item) => {
    const hit = overlay.get(item.key)
    if (!hit) return item
    return {
      ...item,
      featured: hit.featured,
      featuredOrder: hit.featuredOrder,
    }
  })
}
