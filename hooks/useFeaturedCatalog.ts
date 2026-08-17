"use client"

import { useQuery } from "@tanstack/react-query"

import { featuredKeys } from "@/lib/featured-query-keys"
import {
  applyOverlayToItems,
  useFeaturedOverlayQuery,
} from "@/hooks/useFeaturedLists"
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
  type FeaturedCatalogCategory,
  type FeaturedCatalogItem,
} from "@/lib/featured-catalog"
import { getAboutList } from "@/services/aboutService"
import { getDonationSettings } from "@/services/donationsService"
import { getCollectionsList } from "@/services/imageCollectionsService"
import { getNewsList } from "@/services/newsService"
import { getProjectsList } from "@/services/projectsService"
import { getServicesList } from "@/services/servicesService"
import { getSoundsList, searchSounds } from "@/services/soundsService"
import { getVideosList, searchVideosByKeyword } from "@/services/videosService"
import {
  getWritingsList,
  searchWritingsByWriter,
} from "@/services/writingsService"

function compact<T>(items: (T | null | undefined)[]): T[] {
  return items.filter((item): item is T => item != null)
}

async function fetchBrowsePage(
  category: FeaturedCatalogCategory,
  page: number,
  size: number,
  search: string,
): Promise<{ items: FeaturedCatalogItem[]; totalElements: number }> {
  const kw = search.trim()

  if (category === "news") {
    const res = await getNewsList(page, size)
    const items = compact((res.data?.content ?? []).map(mapNewsToCatalogItem))
    return { items, totalElements: res.data?.totalElements ?? items.length }
  }

  if (category === "projects") {
    const res = await getProjectsList(page, size)
    const items = compact((res.data?.content ?? []).map(mapProjectToCatalogItem))
    return { items, totalElements: res.data?.totalElements ?? items.length }
  }

  if (category === "services") {
    const res = await getServicesList(page, size)
    const items = compact((res.data?.content ?? []).map(mapServiceToCatalogItem))
    return { items, totalElements: res.data?.totalElements ?? items.length }
  }

  if (category === "videos") {
    const data =
      kw.length >= 2
        ? await searchVideosByKeyword(kw, page, size)
        : await getVideosList({ page, size })
    const items = compact(data.content.map(mapVideoToCatalogItem))
    return { items, totalElements: data.totalElements ?? items.length }
  }

  if (category === "sounds") {
    const data =
      kw.length >= 1 ? await searchSounds(kw, page, size) : await getSoundsList(page, size)
    const items = compact(data.content.map(mapSoundToCatalogItem))
    return { items, totalElements: data.totalElements ?? items.length }
  }

  if (category === "collections") {
    const data = await getCollectionsList(page, size)
    const items = compact(data.content.map(mapCollectionToCatalogItem))
    return { items, totalElements: data.totalElements ?? items.length }
  }

  if (category === "writings") {
    const data =
      kw.length >= 1
        ? await searchWritingsByWriter(kw, page, size)
        : await getWritingsList(page, size)
    const items = compact(data.content.map(mapWritingToCatalogItem))
    return { items, totalElements: data.totalElements ?? items.length }
  }

  if (category === "about") {
    const data = await getAboutList(page, size)
    const items = compact(data.content.map(mapAboutToCatalogItem))
    return { items, totalElements: data.totalElements ?? items.length }
  }

  if (category === "donation") {
    // A singleton, so this "list" is one row or none — paging is a no-op.
    const settings = await getDonationSettings()
    const items = compact([mapDonationToCatalogItem(settings)])
    return { items, totalElements: items.length }
  }

  // "all" — first page slice from each module, client-merged
  const perModule = Math.max(5, Math.ceil(size / 9))
  const [
    newsRes,
    projectsRes,
    servicesRes,
    videosRes,
    soundsRes,
    collectionsRes,
    writingsRes,
    aboutRes,
    donationRes,
  ] = await Promise.all([
    getNewsList(0, perModule),
    getProjectsList(0, perModule),
    getServicesList(0, perModule),
    getVideosList({ page: 0, size: perModule }),
    kw.length >= 1 ? searchSounds(kw, 0, perModule) : getSoundsList(0, perModule),
    getCollectionsList(0, perModule),
    kw.length >= 1
      ? searchWritingsByWriter(kw, 0, perModule)
      : getWritingsList(0, perModule),
    getAboutList(0, perModule),
    getDonationSettings(),
  ])

  const merged = [
    ...compact((newsRes.data?.content ?? []).map(mapNewsToCatalogItem)),
    ...compact((projectsRes.data?.content ?? []).map(mapProjectToCatalogItem)),
    ...compact((servicesRes.data?.content ?? []).map(mapServiceToCatalogItem)),
    ...compact(videosRes.content.map(mapVideoToCatalogItem)),
    ...compact(soundsRes.content.map(mapSoundToCatalogItem)),
    ...compact(collectionsRes.content.map(mapCollectionToCatalogItem)),
    ...compact(writingsRes.content.map(mapWritingToCatalogItem)),
    ...compact(aboutRes.content.map(mapAboutToCatalogItem)),
    ...compact([mapDonationToCatalogItem(donationRes)]),
  ].sort((a, b) => a.title.localeCompare(b.title, "ckb"))

  const filtered = kw
    ? merged.filter(
        (item) =>
          item.title.toLowerCase().includes(kw.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(kw.toLowerCase()),
      )
    : merged

  const start = page * size
  const pageItems = filtered.slice(start, start + size)
  return { items: pageItems, totalElements: filtered.length }
}

export function useFeaturedBrowseQuery({
  category,
  page,
  size,
  search,
  enabled = true,
}: {
  category: FeaturedCatalogCategory
  page: number
  size: number
  search: string
  enabled?: boolean
}) {
  const overlayQ = useFeaturedOverlayQuery()

  const browseQ = useQuery({
    queryKey: featuredKeys.browse(category, page, size, search),
    queryFn: () => fetchBrowsePage(category, page, size, search),
    enabled,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  })

  const items = applyOverlayToItems(
    browseQ.data?.items ?? [],
    overlayQ.data ?? new Map(),
  )

  return {
    items,
    totalElements: browseQ.data?.totalElements ?? 0,
    isLoading: browseQ.isLoading || overlayQ.isLoading,
    isError: browseQ.isError,
    refetch: () => {
      void browseQ.refetch()
      void overlayQ.refetch()
    },
  }
}
