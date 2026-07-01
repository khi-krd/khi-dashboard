import { patchCollectionFeatured, getFeaturedCollections } from "@/services/imageCollectionsService"
import { patchNewsFeatured, getFeaturedNews } from "@/services/newsService"
import { patchProjectFeatured, getFeaturedProjects } from "@/services/projectsService"
import { patchServiceFeatured, getFeaturedServices } from "@/services/servicesService"
import { patchSoundFeatured, getFeaturedSounds } from "@/services/soundsService"
import { patchVideoFeatured, getFeaturedVideos } from "@/services/videosService"
import { patchWritingFeatured, getFeaturedWritings } from "@/services/writingsService"
import {
  mapCollectionToCatalogItem,
  mapNewsToCatalogItem,
  mapProjectToCatalogItem,
  mapServiceToCatalogItem,
  mapSoundToCatalogItem,
  mapVideoToCatalogItem,
  mapWritingToCatalogItem,
  type FeaturedCatalogItem,
} from "@/lib/featured-catalog"
import type { FeaturedPayload } from "@/types/featured"

export type FeatureableCategory = FeaturedCatalogItem["category"]

export async function patchFeaturedItem(
  category: FeatureableCategory,
  id: number,
  payload: FeaturedPayload,
): Promise<void> {
  switch (category) {
    case "news":
      return patchNewsFeatured(id, payload)
    case "projects":
      return patchProjectFeatured(id, payload)
    case "services":
      return patchServiceFeatured(id, payload)
    case "videos":
      return patchVideoFeatured(id, payload)
    case "sounds":
      return patchSoundFeatured(id, payload)
    case "collections":
      return patchCollectionFeatured(id, payload)
    case "writings":
      return patchWritingFeatured(id, payload)
  }
}

export async function fetchFeaturedCatalogItems(
  category: FeatureableCategory,
  page: number,
  size: number,
): Promise<FeaturedCatalogItem[]> {
  switch (category) {
    case "news": {
      const pageData = await getFeaturedNews(page, size)
      return (pageData.content ?? [])
        .map((item) =>
          mapNewsToCatalogItem({ ...item, featured: item.featured ?? true }),
        )
        .filter((item): item is FeaturedCatalogItem => item != null && item.featured)
    }
    case "projects": {
      const pageData = await getFeaturedProjects(page, size)
      return (pageData.content ?? [])
        .map((item) =>
          mapProjectToCatalogItem({ ...item, featured: item.featured ?? true }),
        )
        .filter((item): item is FeaturedCatalogItem => item != null && item.featured)
    }
    case "services": {
      const pageData = await getFeaturedServices(page, size)
      return (pageData.content ?? [])
        .map((item) =>
          mapServiceToCatalogItem({ ...item, featured: item.featured ?? true }),
        )
        .filter((item): item is FeaturedCatalogItem => item != null && item.featured)
    }
    case "videos": {
      const pageData = await getFeaturedVideos(page, size)
      return (pageData.content ?? [])
        .map((item) =>
          mapVideoToCatalogItem({ ...item, featured: item.featured ?? true }),
        )
        .filter((item): item is FeaturedCatalogItem => item != null && item.featured)
    }
    case "sounds": {
      const pageData = await getFeaturedSounds(page, size)
      return (pageData.content ?? [])
        .map((item) =>
          mapSoundToCatalogItem({ ...item, featured: item.featured ?? true }),
        )
        .filter((item): item is FeaturedCatalogItem => item != null && item.featured)
    }
    case "collections": {
      const pageData = await getFeaturedCollections(page, size)
      return (pageData.content ?? [])
        .map((item) =>
          mapCollectionToCatalogItem({ ...item, featured: item.featured ?? true }),
        )
        .filter((item): item is FeaturedCatalogItem => item != null && item.featured)
    }
    case "writings": {
      const pageData = await getFeaturedWritings(page, size)
      return (pageData.content ?? [])
        .map((item) =>
          mapWritingToCatalogItem({ ...item, featured: item.featured ?? true }),
        )
        .filter((item): item is FeaturedCatalogItem => item != null && item.featured)
    }
  }
}
