"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"

import { fetchFeaturedCatalogItems, patchFeaturedItem } from "@/lib/featured-api"
import { syncFeaturedSoundsCache, syncFeaturedWritingsCache } from "@/lib/featured-cache-sync"
import {
  FEATURED_CATALOG_CATEGORIES,
  type FeaturedCatalogItem,
} from "@/lib/featured-catalog"
import { featuredKeys } from "@/lib/featured-query-keys"
import { setStoredFeatured } from "@/lib/featured-storage"
import type { FeaturedPayload } from "@/types/featured"

const FEATUREABLE_CATEGORIES = FEATURED_CATALOG_CATEGORIES.filter(
  (category) => category !== "all",
)

function sortFeaturedItems(items: FeaturedCatalogItem[]) {
  return [...items].sort((a, b) => {
    const categoryOrder =
      FEATUREABLE_CATEGORIES.indexOf(a.category) -
      FEATUREABLE_CATEGORIES.indexOf(b.category)
    if (categoryOrder !== 0) return categoryOrder
    return (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0)
  })
}

export function useFeaturedAllQuery(page: number, size: number) {
  return useQuery({
    queryKey: featuredKeys.allItems(page, size),
    queryFn: async () => {
      const results = await Promise.allSettled(
        FEATUREABLE_CATEGORIES.map((category) =>
          fetchFeaturedCatalogItems(category, page, size),
        ),
      )

      const fulfilled: FeaturedCatalogItem[][] = []
      const rejected: Array<{ category: string; reason: unknown }> = []

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          fulfilled.push(result.value)
        } else {
          rejected.push({
            category: FEATUREABLE_CATEGORIES[index] ?? String(index),
            reason: result.reason,
          })
        }
      })

      if (fulfilled.length === 0 && rejected.length > 0) {
        const first = rejected[0].reason
        throw first instanceof Error
          ? first
          : new Error("Failed to load featured content")
      }

      if (rejected.length > 0) {
        console.warn("[featured] partial fetch failures", rejected)
      }

      const items = fulfilled.flat()

      return {
        items: sortFeaturedItems(items),
        totalElements: items.length,
      }
    },
    staleTime: 1000 * 30,
  })
}

export function usePatchFeaturedMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      item,
      payload,
    }: {
      item: FeaturedCatalogItem
      payload: FeaturedPayload
    }) => patchFeaturedItem(item.category, item.id, payload),
    onSuccess: (_, { item, payload }) => {
      const featured = payload.featured !== false
      const featuredOrder = featured ? (payload.featuredOrder ?? null) : null

      if (item.category === "sounds") {
        syncFeaturedSoundsCache(queryClient, item.id, featured, featuredOrder)
      } else if (item.category === "writings") {
        syncFeaturedWritingsCache(queryClient, item.id, featured, featuredOrder)
      } else {
        setStoredFeatured(item.category, item.id, featured, featuredOrder)
        queryClient.setQueryData<
          Map<string, { featured: boolean; featuredOrder: number | null }>
        >(featuredKeys.overlay(), (prev) => {
          const next = new Map(prev ?? [])
          if (!featured) next.delete(item.key)
          else next.set(item.key, { featured: true, featuredOrder })
          return next
        })
      }

      void queryClient.invalidateQueries({ queryKey: featuredKeys.all })
      void queryClient.invalidateQueries({ queryKey: ["featured-catalog"] })
    },
  })
}
