import { getFeaturedAboutPages, patchAboutFeatured } from "@/services/aboutService"
import {
  getDonationSettings,
  patchDonationSettingsFeatured,
} from "@/services/donationsService"
import { patchCollectionFeatured, getFeaturedCollections } from "@/services/imageCollectionsService"
import { patchNewsFeatured, getFeaturedNews } from "@/services/newsService"
import { patchProjectFeatured, getFeaturedProjects } from "@/services/projectsService"
import { patchServiceFeatured, getFeaturedServices } from "@/services/servicesService"
import { patchSoundFeatured, getFeaturedSounds } from "@/services/soundsService"
import { patchVideoFeatured, getFeaturedVideos } from "@/services/videosService"
import { patchWritingFeatured, getFeaturedWritings } from "@/services/writingsService"
import {
  mapAboutToCatalogItem,
  mapCollectionToCatalogItem,
  mapDonationToCatalogItem,
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
    case "about":
      return patchAboutFeatured(id, payload)
    case "donation":
      // Singleton — the id is only the catalog key, the endpoint takes none.
      await patchDonationSettingsFeatured(payload)
      return
  }
}

/** Rows from GET /featured are featured by endpoint semantics. */
function keepMapped(
  items: Array<FeaturedCatalogItem | null>,
): FeaturedCatalogItem[] {
  return items.filter((item): item is FeaturedCatalogItem => item != null)
}

export async function fetchFeaturedCatalogItems(
  category: FeatureableCategory,
  page: number,
  size: number,
): Promise<FeaturedCatalogItem[]> {
  switch (category) {
    case "news": {
      const pageData = await getFeaturedNews(page, size)
      return keepMapped(
        (pageData.content ?? []).map((item) =>
          mapNewsToCatalogItem({ ...item, featured: true }),
        ),
      )
    }
    case "projects": {
      const pageData = await getFeaturedProjects(page, size)
      return keepMapped(
        (pageData.content ?? []).map((item) =>
          mapProjectToCatalogItem({ ...item, featured: true }),
        ),
      )
    }
    case "services": {
      const pageData = await getFeaturedServices(page, size)
      return keepMapped(
        (pageData.content ?? []).map((item) =>
          mapServiceToCatalogItem({ ...item, featured: true }),
        ),
      )
    }
    case "videos": {
      const pageData = await getFeaturedVideos(page, size)
      return keepMapped(
        (pageData.content ?? []).map((item) =>
          mapVideoToCatalogItem({ ...item, featured: true }),
        ),
      )
    }
    case "sounds": {
      const pageData = await getFeaturedSounds(page, size)
      return keepMapped(
        (pageData.content ?? []).map((item) =>
          mapSoundToCatalogItem({ ...item, featured: true }),
        ),
      )
    }
    case "collections": {
      const pageData = await getFeaturedCollections(page, size)
      return keepMapped(
        (pageData.content ?? []).map((item) =>
          mapCollectionToCatalogItem({ ...item, featured: true }),
        ),
      )
    }
    case "writings": {
      const pageData = await getFeaturedWritings(page, size)
      return keepMapped(
        (pageData.content ?? []).map((item) =>
          mapWritingToCatalogItem({ ...item, featured: true }),
        ),
      )
    }
    case "about": {
      // No `/about/featured` route exists — the list is scanned and filtered.
      const items = await getFeaturedAboutPages()
      return keepMapped(
        items.map((item) => mapAboutToCatalogItem({ ...item, featured: true })),
      )
    }
    case "donation": {
      // At most one slide, so paging never applies.
      const settings = await getDonationSettings()
      if (!settings?.featured) return []
      return keepMapped([mapDonationToCatalogItem(settings)])
    }
  }
}
