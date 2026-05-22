"use client"

import { useQuery } from "@tanstack/react-query"

import { getAboutList } from "@/services/aboutService"
import { getCollectionsList } from "@/services/imageCollectionsService"
import { getNewsList } from "@/services/newsService"
import { getProjectsList } from "@/services/projectsService"
import { getServicesList } from "@/services/servicesService"
import { getSoundsList } from "@/services/soundsService"
import { getVideosList } from "@/services/videosService"
import { getWritingsList } from "@/services/writingsService"
import { dashboardKeys } from "@/lib/dashboard-query-keys"
import {
  buildDashboardOverviewData,
  type DashboardModuleKey,
} from "@/lib/dashboard-overview"
import type { AboutPage } from "@/types/about"
import type { CollectionPage } from "@/types/image-collections"
import type { NewsListResponse } from "@/types/news"
import type { ProjectListResponse } from "@/types/projects"
import type { ServiceListResponse } from "@/types/services"
import type { SoundPage } from "@/types/sounds"
import type { VideoPage } from "@/types/videos"
import type { WritingPage } from "@/types/writings"

const PAGE_SIZE = 5

const EMPTY_ABOUT_PAGE: AboutPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: PAGE_SIZE,
}

const EMPTY_NEWS_RESPONSE: NewsListResponse = {
  success: false,
  message: "dashboard_fallback",
  data: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: PAGE_SIZE,
    number: 0,
    first: true,
    last: true,
    empty: true,
  },
}

const EMPTY_PROJECT_RESPONSE: ProjectListResponse = {
  success: false,
  message: "dashboard_fallback",
  data: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: PAGE_SIZE,
    number: 0,
    first: true,
    last: true,
    empty: true,
  },
}

const EMPTY_SERVICE_RESPONSE: ServiceListResponse = {
  success: false,
  message: "dashboard_fallback",
  data: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: PAGE_SIZE,
    number: 0,
    first: true,
    last: true,
    empty: true,
  },
}

const EMPTY_VIDEO_PAGE: VideoPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: PAGE_SIZE,
  number: 0,
  first: true,
  last: true,
  empty: true,
}

const EMPTY_SOUND_PAGE: SoundPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: PAGE_SIZE,
  number: 0,
  first: true,
  last: true,
  empty: true,
}

const EMPTY_COLLECTION_PAGE: CollectionPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: PAGE_SIZE,
  number: 0,
  first: true,
  last: true,
  empty: true,
}

const EMPTY_WRITING_PAGE: WritingPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: PAGE_SIZE,
  number: 0,
  first: true,
  last: true,
  empty: true,
}

function unwrapSettled<T>(
  key: DashboardModuleKey,
  settled: PromiseSettledResult<T>,
  fallback: T,
  failed: DashboardModuleKey[],
): T {
  if (settled.status === "fulfilled") return settled.value
  failed.push(key)
  return fallback
}

async function fetchDashboardOverview() {
  const failedModules: DashboardModuleKey[] = []

  const [
    aboutResult,
    newsResult,
    projectsResult,
    servicesResult,
    videosResult,
    soundsResult,
    collectionsResult,
    writingsResult,
  ] = await Promise.allSettled([
    getAboutList(0, PAGE_SIZE),
    getNewsList(0, PAGE_SIZE),
    getProjectsList(0, PAGE_SIZE),
    getServicesList(0, PAGE_SIZE),
    getVideosList(0, PAGE_SIZE),
    getSoundsList(0, PAGE_SIZE),
    getCollectionsList(0, PAGE_SIZE),
    getWritingsList(0, PAGE_SIZE),
  ])

  return buildDashboardOverviewData({
    about: unwrapSettled("about", aboutResult, EMPTY_ABOUT_PAGE, failedModules),
    news: unwrapSettled("news", newsResult, EMPTY_NEWS_RESPONSE, failedModules),
    projects: unwrapSettled(
      "projects",
      projectsResult,
      EMPTY_PROJECT_RESPONSE,
      failedModules,
    ),
    services: unwrapSettled(
      "services",
      servicesResult,
      EMPTY_SERVICE_RESPONSE,
      failedModules,
    ),
    videos: unwrapSettled("videos", videosResult, EMPTY_VIDEO_PAGE, failedModules),
    sounds: unwrapSettled("sounds", soundsResult, EMPTY_SOUND_PAGE, failedModules),
    collections: unwrapSettled(
      "collections",
      collectionsResult,
      EMPTY_COLLECTION_PAGE,
      failedModules,
    ),
    writings: unwrapSettled(
      "writings",
      writingsResult,
      EMPTY_WRITING_PAGE,
      failedModules,
    ),
    forceFailed: failedModules,
  })
}

export function useDashboardOverviewQuery() {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: fetchDashboardOverview,
    staleTime: 1000 * 60 * 2,
  })
}
