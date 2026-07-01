import type { QueryClient } from "@tanstack/react-query"

import { featuredKeys } from "@/lib/featured-query-keys"
import { setStoredFeatured } from "@/lib/featured-storage"
import {
  mapSoundToCatalogItem,
  mapWritingToCatalogItem,
  type FeaturedCatalogItem,
} from "@/lib/featured-catalog"
import { soundKeys } from "@/lib/sounds-query-keys"
import { writingsKeys } from "@/lib/writings-query-keys"
import type { SoundDto } from "@/types/sounds"
import type { WritingDto } from "@/types/writings"

type FeaturedListCache = {
  items: FeaturedCatalogItem[]
  totalElements: number
}

function sortFeaturedItems(items: FeaturedCatalogItem[]) {
  return [...items].sort(
    (a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0),
  )
}

function resolveSoundDto(
  queryClient: QueryClient,
  id: number,
): SoundDto | undefined {
  const detail = queryClient.getQueryData<SoundDto>(soundKeys.detail(id))
  if (detail) return detail

  const listQueries = queryClient.getQueriesData<{ content?: SoundDto[] }>({
    queryKey: soundKeys.lists(),
  })
  for (const [, data] of listQueries) {
    const hit = data?.content?.find((sound) => sound.id === id)
    if (hit) return hit
  }
  return undefined
}

function resolveWritingDto(
  queryClient: QueryClient,
  id: number,
): WritingDto | undefined {
  const detail = queryClient.getQueryData<WritingDto>(writingsKeys.detail(id))
  if (detail) return detail

  const listQueries = queryClient.getQueriesData<{ content?: WritingDto[] }>({
    queryKey: writingsKeys.lists(),
  })
  for (const [, data] of listQueries) {
    const hit = data?.content?.find((writing) => writing.id === id)
    if (hit) return hit
  }
  return undefined
}

export function syncFeaturedSoundsCache(
  queryClient: QueryClient,
  id: number,
  featured: boolean,
  featuredOrder: number | null,
) {
  queryClient.setQueriesData<FeaturedListCache>(
    { queryKey: [...featuredKeys.all, "sounds"] },
    (prev) => {
      const current = prev ?? { items: [], totalElements: 0 }
      let items = [...current.items]

      if (!featured) {
        items = items.filter((item) => item.id !== id)
      } else {
        const existing = items.find((item) => item.id === id)
        if (existing) {
          items = items.map((item) =>
            item.id === id ? { ...item, featured: true, featuredOrder } : item,
          )
        } else {
          const dto = resolveSoundDto(queryClient, id)
          if (dto) {
            const mapped = mapSoundToCatalogItem({
              ...dto,
              featured: true,
              featuredOrder,
            })
            if (mapped) items.push(mapped)
          }
        }
      }

      items = sortFeaturedItems(items)
      return { items, totalElements: items.length }
    },
  )

  const overlayKey = featuredKeys.overlay()
  queryClient.setQueryData<Map<string, { featured: boolean; featuredOrder: number | null }>>(
    overlayKey,
    (prev) => {
      const next = new Map(prev ?? [])
      const key = `sounds-${id}`
      if (!featured) next.delete(key)
      else next.set(key, { featured: true, featuredOrder })
      return next
    },
  )
  setStoredFeatured("sounds", id, featured, featuredOrder)
}

export function syncFeaturedWritingsCache(
  queryClient: QueryClient,
  id: number,
  featured: boolean,
  featuredOrder: number | null,
) {
  queryClient.setQueriesData<FeaturedListCache>(
    { queryKey: [...featuredKeys.all, "writings"] },
    (prev) => {
      const current = prev ?? { items: [], totalElements: 0 }
      let items = [...current.items]

      if (!featured) {
        items = items.filter((item) => item.id !== id)
      } else {
        const existing = items.find((item) => item.id === id)
        if (existing) {
          items = items.map((item) =>
            item.id === id ? { ...item, featured: true, featuredOrder } : item,
          )
        } else {
          const dto = resolveWritingDto(queryClient, id)
          if (dto) {
            const mapped = mapWritingToCatalogItem({
              ...dto,
              featured: true,
              featuredOrder,
            })
            if (mapped) items.push(mapped)
          }
        }
      }

      items = sortFeaturedItems(items)
      return { items, totalElements: items.length }
    },
  )

  const overlayKey = featuredKeys.overlay()
  queryClient.setQueryData<Map<string, { featured: boolean; featuredOrder: number | null }>>(
    overlayKey,
    (prev) => {
      const next = new Map(prev ?? [])
      const key = `writings-${id}`
      if (!featured) next.delete(key)
      else next.set(key, { featured: true, featuredOrder })
      return next
    },
  )
  setStoredFeatured("writings", id, featured, featuredOrder)
}
