"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { featuredKeys } from "@/lib/featured-query-keys"
import { fetchFeaturedCatalogItems } from "@/lib/featured-api"
import {
  applyFeaturedOverlay,
  buildFeaturedOverlay,
} from "@/lib/featured-overlay"
import { getStoredFeaturedIds, setStoredFeatured } from "@/lib/featured-storage"
import {
  FEATURED_CATALOG_CATEGORIES,
  mapSoundToCatalogItem,
  mapWritingToCatalogItem,
  type FeaturedCatalogItem,
} from "@/lib/featured-catalog"
import { soundKeys } from "@/lib/sounds-query-keys"
import { writingsKeys } from "@/lib/writings-query-keys"
import { getFeaturedSounds, getSoundsList } from "@/services/soundsService"
import { getFeaturedWritings, getWritingsList } from "@/services/writingsService"
import type { SoundDto, SoundPage } from "@/types/sounds"
import type { WritingDto, WritingPage } from "@/types/writings"

const FEATURED_FETCH_SIZE = 200
const FEATUREABLE_CATEGORIES = FEATURED_CATALOG_CATEGORIES.filter(
  (category) => category !== "all",
)

function collectFeaturedSoundsFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
): SoundDto[] {
  const byId = new Map<number, SoundDto>()
  const listQueries = queryClient.getQueriesData<SoundPage>({
    queryKey: soundKeys.lists(),
  })
  for (const [, data] of listQueries) {
    for (const sound of data?.content ?? []) {
      if (sound.id && sound.featured) byId.set(sound.id, sound)
    }
  }
  const details = queryClient.getQueriesData<SoundDto>({
    queryKey: soundKeys.all,
  })
  for (const [key, data] of details) {
    if (!Array.isArray(key) || key[2] !== "detail" || !data?.id) continue
    if (data.featured) byId.set(data.id, data)
  }
  return [...byId.values()]
}

function collectFeaturedWritingsFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
): WritingDto[] {
  const byId = new Map<number, WritingDto>()
  const listQueries = queryClient.getQueriesData<WritingPage>({
    queryKey: writingsKeys.lists(),
  })
  for (const [, data] of listQueries) {
    for (const writing of data?.content ?? []) {
      if (writing.id && writing.featured) byId.set(writing.id, writing)
    }
  }
  const details = queryClient.getQueriesData<WritingDto>({
    queryKey: writingsKeys.all,
  })
  for (const [key, data] of details) {
    if (!Array.isArray(key) || key[2] !== "detail" || !data?.id) continue
    if (data.featured) byId.set(data.id, data)
  }
  return [...byId.values()]
}

function mergeFeaturedSounds(
  apiItems: SoundDto[],
  cacheItems: SoundDto[],
  storedIds: { id: number; featuredOrder: number }[],
): SoundDto[] {
  const byId = new Map<number, SoundDto>()
  for (const item of [...apiItems, ...cacheItems]) {
    if (item.id) byId.set(item.id, item)
  }
  for (const stored of storedIds) {
    if (!byId.has(stored.id)) {
      byId.set(stored.id, {
        id: stored.id,
        trackState: "SINGLE",
        contentLanguages: [],
        featured: true,
        featuredOrder: stored.featuredOrder,
      })
    } else {
      const current = byId.get(stored.id)!
      byId.set(stored.id, {
        ...current,
        featured: true,
        featuredOrder: stored.featuredOrder ?? current.featuredOrder,
      })
    }
  }
  return [...byId.values()].filter((s) => s.featured)
}

function mergeFeaturedWritings(
  apiItems: WritingDto[],
  cacheItems: WritingDto[],
  storedIds: { id: number; featuredOrder: number }[],
): WritingDto[] {
  const byId = new Map<number, WritingDto>()
  for (const item of [...apiItems, ...cacheItems]) {
    if (item.id) byId.set(item.id, item)
  }
  for (const stored of storedIds) {
    if (!byId.has(stored.id)) {
      byId.set(stored.id, {
        id: stored.id,
        bookGenres: [],
        contentLanguages: [],
        featured: true,
        featuredOrder: stored.featuredOrder,
      })
    } else {
      const current = byId.get(stored.id)!
      byId.set(stored.id, {
        ...current,
        featured: true,
        featuredOrder: stored.featuredOrder ?? current.featuredOrder,
      })
    }
  }
  return [...byId.values()].filter((w) => w.featured)
}

function enrichFeaturedSounds(
  queryClient: ReturnType<typeof useQueryClient>,
  sounds: SoundDto[],
): SoundDto[] {
  return sounds.map((sound) => {
    if (!sound.id) return sound
    const hasTitle =
      sound.ckbContent?.title?.trim() || sound.kmrContent?.title?.trim()
    if (hasTitle) return sound
    const listQueries = queryClient.getQueriesData<SoundPage>({
      queryKey: soundKeys.lists(),
    })
    for (const [, data] of listQueries) {
      const hit = data?.content?.find((entry) => entry.id === sound.id)
      if (hit) {
        return {
          ...hit,
          featured: true,
          featuredOrder: sound.featuredOrder ?? hit.featuredOrder,
        }
      }
    }
    const detail = queryClient.getQueryData<SoundDto>(soundKeys.detail(sound.id))
    if (detail) {
      return {
        ...detail,
        featured: true,
        featuredOrder: sound.featuredOrder ?? detail.featuredOrder,
      }
    }
    return sound
  })
}

function enrichFeaturedWritings(
  queryClient: ReturnType<typeof useQueryClient>,
  writings: WritingDto[],
): WritingDto[] {
  return writings.map((writing) => {
    if (!writing.id) return writing
    const hasTitle =
      writing.ckbContent?.title?.trim() || writing.kmrContent?.title?.trim()
    if (hasTitle) return writing
    const listQueries = queryClient.getQueriesData<WritingPage>({
      queryKey: writingsKeys.lists(),
    })
    for (const [, data] of listQueries) {
      const hit = data?.content?.find((entry) => entry.id === writing.id)
      if (hit) {
        return {
          ...hit,
          featured: true,
          featuredOrder: writing.featuredOrder ?? hit.featuredOrder,
        }
      }
    }
    const detail = queryClient.getQueryData<WritingDto>(
      writingsKeys.detail(writing.id),
    )
    if (detail) {
      return {
        ...detail,
        featured: true,
        featuredOrder: writing.featuredOrder ?? detail.featuredOrder,
      }
    }
    return writing
  })
}

export function useFeaturedSoundsQuery(page: number, size: number) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: featuredKeys.sounds(page, size),
    queryFn: async () => {
      let apiItems: SoundDto[] = []
      try {
        const pageData = await getFeaturedSounds(page, size)
        apiItems = pageData.content.map((sound) => ({
          ...sound,
          featured: sound.featured ?? true,
        }))
        for (const sound of apiItems) {
          if (sound.id && sound.featured) {
            setStoredFeatured(
              "sounds",
              sound.id,
              true,
              sound.featuredOrder ?? 0,
            )
          }
        }
      } catch {
        apiItems = []
      }
      const cacheItems = collectFeaturedSoundsFromCache(queryClient)
      const storedIds = getStoredFeaturedIds("sounds")
      const merged = mergeFeaturedSounds(apiItems, cacheItems, storedIds)
      let enriched = enrichFeaturedSounds(queryClient, merged)
      const needsList =
        enriched.some(
          (sound) =>
            sound.id &&
            !sound.ckbContent?.title?.trim() &&
            !sound.kmrContent?.title?.trim(),
        ) && storedIds.length > 0
      if (needsList) {
        const listPage = await getSoundsList(0, 500)
        const byId = new Map(
          listPage.content
            .filter((sound) => sound.id != null)
            .map((sound) => [sound.id!, sound]),
        )
        enriched = enriched.map((sound) => {
          if (!sound.id) return sound
          const hit = byId.get(sound.id)
          if (!hit) return sound
          return {
            ...hit,
            featured: true,
            featuredOrder: sound.featuredOrder ?? hit.featuredOrder,
          }
        })
      }
      return {
        items: enriched
          .map(mapSoundToCatalogItem)
          .filter(
            (item): item is FeaturedCatalogItem =>
              item != null && item.featured,
          )
          .sort(
            (a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0),
          ),
        totalElements: enriched.filter((sound) => sound.featured).length,
      }
    },
    staleTime: 1000 * 30,
  })
}

export function useFeaturedWritingsQuery(page: number, size: number) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: featuredKeys.writings(page, size),
    queryFn: async () => {
      let apiItems: WritingDto[] = []
      try {
        const pageData = await getFeaturedWritings(page, size)
        apiItems = pageData.content.map((writing) => ({
          ...writing,
          featured: writing.featured ?? true,
        }))
        for (const writing of apiItems) {
          if (writing.id && writing.featured) {
            setStoredFeatured(
              "writings",
              writing.id,
              true,
              writing.featuredOrder ?? 0,
            )
          }
        }
      } catch {
        apiItems = []
      }
      const cacheItems = collectFeaturedWritingsFromCache(queryClient)
      const storedIds = getStoredFeaturedIds("writings")
      const merged = mergeFeaturedWritings(apiItems, cacheItems, storedIds)
      let enriched = enrichFeaturedWritings(queryClient, merged)
      const needsList =
        enriched.some(
          (writing) =>
            writing.id &&
            !writing.ckbContent?.title?.trim() &&
            !writing.kmrContent?.title?.trim(),
        ) && storedIds.length > 0
      if (needsList) {
        const listPage = await getWritingsList(0, 500)
        const byId = new Map(
          listPage.content
            .filter((writing) => writing.id != null)
            .map((writing) => [writing.id!, writing]),
        )
        enriched = enriched.map((writing) => {
          if (!writing.id) return writing
          const hit = byId.get(writing.id)
          if (!hit) return writing
          return {
            ...hit,
            featured: true,
            featuredOrder: writing.featuredOrder ?? hit.featuredOrder,
          }
        })
      }
      return {
        items: enriched
          .map(mapWritingToCatalogItem)
          .filter(
            (item): item is FeaturedCatalogItem =>
              item != null && item.featured,
          )
          .sort(
            (a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0),
          ),
        totalElements: enriched.filter((writing) => writing.featured).length,
      }
    },
    staleTime: 1000 * 30,
  })
}

export function useFeaturedOverlayQuery() {
  return useQuery({
    queryKey: featuredKeys.overlay(),
    queryFn: async () => {
      const results = await Promise.allSettled(
        FEATUREABLE_CATEGORIES.map((category) =>
          fetchFeaturedCatalogItems(category, 0, FEATURED_FETCH_SIZE),
        ),
      )

      const sources = FEATUREABLE_CATEGORIES.map((category, index) => {
        const result = results[index]
        const items =
          result?.status === "fulfilled"
            ? result.value.map((item) => ({
                id: item.id,
                featured: true,
                featuredOrder: item.featuredOrder,
              }))
            : getStoredFeaturedIds(category).map((stored) => ({
                id: stored.id,
                featured: true,
                featuredOrder: stored.featuredOrder,
              }))

        for (const item of items) {
          if (item.id) {
            setStoredFeatured(
              category,
              item.id,
              true,
              item.featuredOrder ?? 0,
            )
          }
        }

        return { keyPrefix: category, items }
      })

      return buildFeaturedOverlay(sources)
    },
    staleTime: 1000 * 30,
  })
}

export function useFeaturedStats() {
  const soundsQ = useFeaturedSoundsQuery(0, FEATURED_FETCH_SIZE)
  const writingsQ = useFeaturedWritingsQuery(0, FEATURED_FETCH_SIZE)

  return useMemo(
    () => ({
      soundsCount: soundsQ.data?.totalElements ?? 0,
      writingsCount: writingsQ.data?.totalElements ?? 0,
      totalFeatured:
        (soundsQ.data?.totalElements ?? 0) +
        (writingsQ.data?.totalElements ?? 0),
      isLoading: soundsQ.isLoading || writingsQ.isLoading,
    }),
    [soundsQ.data, writingsQ.data, soundsQ.isLoading, writingsQ.isLoading],
  )
}

export function applyOverlayToItems(
  items: FeaturedCatalogItem[],
  overlay: Map<string, { featured: boolean; featuredOrder: number | null }>,
): FeaturedCatalogItem[] {
  return applyFeaturedOverlay(items, overlay)
}
