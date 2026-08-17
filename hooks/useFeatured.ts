"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"

import { aboutKeys } from "@/lib/about-query-keys"
import { donationKeys } from "@/lib/donations-query-keys"
import { servicesKeys } from "@/lib/services-query-keys"
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

/**
 * Mirrors how the carousel pools its candidates: one list across all nine
 * sources ordered on `featuredOrder` with nulls last, ties broken by newest id
 * first.
 *
 * The tiebreak matters more than it looks. Records featured before the order
 * became global still carry per-category numbers, so duplicate `featuredOrder`
 * values across sources are the normal state, not an edge case — grouping
 * those ties by category would show an order the live carousel does not have.
 * Ids collide across tables, so a tie between two sources is genuinely
 * arbitrary server-side; dragging the row writes an explicit order and settles
 * it.
 */
function sortFeaturedItems(items: FeaturedCatalogItem[]) {
  return [...items].sort((a, b) => {
    const aOrder = a.featuredOrder ?? Number.POSITIVE_INFINITY
    const bOrder = b.featuredOrder ?? Number.POSITIVE_INFINITY
    if (aOrder !== bOrder) return aOrder - bOrder
    return b.id - a.id
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

      // The three institutional sources are read back through their own
      // screens' caches, and those DTOs now carry the featured fields — so a
      // toggle here has to invalidate them or the About list and the donation
      // settings screen keep showing the pre-toggle state.
      if (item.category === "about") {
        void queryClient.invalidateQueries({ queryKey: aboutKeys.all })
      } else if (item.category === "donation") {
        void queryClient.invalidateQueries({ queryKey: donationKeys.all })
      } else if (item.category === "services") {
        void queryClient.invalidateQueries({ queryKey: servicesKeys.all })
      }
    },
  })
}
