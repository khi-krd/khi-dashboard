"use client"

import { useQuery } from "@tanstack/react-query"

import { featuredKeys } from "@/lib/featured-query-keys"
import { fetchFeaturedCatalogItems } from "@/lib/featured-api"
import {
  applyFeaturedOverlay,
  buildFeaturedOverlay,
} from "@/lib/featured-overlay"
import {
  FEATURED_CATALOG_CATEGORIES,
  type FeaturedCatalogItem,
} from "@/lib/featured-catalog"

const FEATURED_FETCH_SIZE = 200
const FEATUREABLE_CATEGORIES = FEATURED_CATALOG_CATEGORIES.filter(
  (category) => category !== "all",
)

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
            : []

        return { keyPrefix: category, items }
      })

      return buildFeaturedOverlay(sources)
    },
    staleTime: 1000 * 30,
  })
}

export function applyOverlayToItems(
  items: FeaturedCatalogItem[],
  overlay: Map<string, { featured: boolean; featuredOrder: number | null }>,
): FeaturedCatalogItem[] {
  return applyFeaturedOverlay(items, overlay)
}
