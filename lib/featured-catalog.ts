import type { AboutDto } from "@/types/about"
import type { DonationSettingsDto } from "@/types/donations"
import type { CollectionDto } from "@/types/image-collections"
import type { NewsDto } from "@/types/news"
import type { ProjectDto } from "@/types/projects"
import type { ServiceDto } from "@/types/services"
import { getServiceContent } from "@/types/services-ui"
import type { SoundDto } from "@/types/sounds"
import type { VideoDto } from "@/types/videos"
import type { WritingDto } from "@/types/writings"

export const FEATURED_CATALOG_CATEGORIES = [
  "all",
  "news",
  "projects",
  "services",
  "videos",
  "sounds",
  "collections",
  "writings",
  "about",
  "donation",
] as const

export type FeaturedCatalogCategory = (typeof FEATURED_CATALOG_CATEGORIES)[number]

/**
 * The global slide cap, `SiteSettings.maxFeaturedSlides`. Shared by all nine
 * sources — About pages, services and the donation page draw from the same
 * budget as news and videos.
 *
 * Hardcoded because the setting has no HTTP endpoint yet: the service methods
 * exist on the backend but no controller exposes them, so today the row can
 * only be changed in the database. Swap this for a fetch once it is exposed.
 */
export const MAX_FEATURED_SLIDES = 7

/**
 * The donation page is a settings singleton, so there is no "which record" to
 * point at. The id is only ever used to build a stable catalog key — the PATCH
 * itself takes no id at all.
 */
export const DONATION_SINGLETON_ID = 1

export type FeaturedCatalogStatusFilter = "all" | "featured" | "not_featured"

export type FeaturedCatalogItem = {
  key: string
  id: number
  category: Exclude<FeaturedCatalogCategory, "all">
  categoryLabel: string
  title: string
  subtitle?: string | null
  coverUrl?: string | null
  /**
   * The wide carousel hero. All nine sources now carry it, including services
   * — not to be confused with their `featureImageUrls` (plural), which is an
   * unrelated legacy gallery list.
   */
  featureImageUrl?: string | null
  coverAspect: "square" | "book" | "wide"
  featured: boolean
  featuredOrder?: number | null
  canFeature: boolean
  /**
   * True for the three institutional sources, whose PATCH fails with `400`
   * rather than producing a slide that silently never renders. The six
   * publication types are dropped server-side instead, so a blank image there
   * is a warning, not a hard block.
   */
  strictImage: boolean
  detailHref: string
  editHref: string
}

/**
 * What the slide will actually paint: the hero wins, then the source's own
 * fallback. Mirrors the backend's `firstNonBlank` resolution — a candidate
 * with neither is dropped from `/featured` entirely.
 */
export function resolvedSlideImage(item: FeaturedCatalogItem): string | null {
  return item.featureImageUrl?.trim() || item.coverUrl?.trim() || null
}

/**
 * Whether featuring this item will be accepted. Only the three institutional
 * sources validate server-side, so only they can block the button.
 */
export function canFeatureNow(item: FeaturedCatalogItem): boolean {
  if (!item.canFeature) return false
  if (!item.strictImage) return true
  return resolvedSlideImage(item) != null
}

export const FEATURED_CATEGORY_LABELS: Record<
  Exclude<FeaturedCatalogCategory, "all">,
  string
> = {
  news: "هەواڵەکان",
  projects: "پرۆژەکان",
  services: "خزمەتگوزارییەکان",
  videos: "ڤیدیۆکان",
  sounds: "دەنگەکان",
  collections: "کۆمەڵە وێنەکان",
  writings: "نووسراوەکان",
  about: "دەربارە",
  donation: "بەخشین",
}

function bilingualTitle(
  ckb?: string | null,
  kmr?: string | null,
): string {
  return ckb?.trim() || kmr?.trim() || ""
}

function bilingualCover(
  ckb?: string | null,
  kmr?: string | null,
  hover?: string | null,
): string | null {
  return ckb?.trim() || kmr?.trim() || hover?.trim() || null
}

export function mapNewsToCatalogItem(news: NewsDto): FeaturedCatalogItem | null {
  if (!news.id) return null
  return {
    key: `news-${news.id}`,
    id: news.id,
    category: "news",
    categoryLabel: FEATURED_CATEGORY_LABELS.news,
    title: bilingualTitle(news.ckbContent?.title, news.kmrContent?.title),
    subtitle:
      news.category?.ckbName?.trim() ||
      news.category?.kmrName?.trim() ||
      null,
    coverUrl: news.coverUrl?.trim() || news.coverThumbnailUrl?.trim() || null,
    featureImageUrl: news.featureImageUrl?.trim() || null,
    coverAspect: "wide",
    featured: !!news.featured,
    featuredOrder: news.featuredOrder,
    canFeature: true,
    strictImage: false,
    detailHref: `/dashboard/news/${news.id}`,
    editHref: `/dashboard/news/${news.id}/edit`,
  }
}

export function mapProjectToCatalogItem(
  project: ProjectDto,
): FeaturedCatalogItem | null {
  if (!project.id) return null
  return {
    key: `projects-${project.id}`,
    id: project.id,
    category: "projects",
    categoryLabel: FEATURED_CATEGORY_LABELS.projects,
    title: bilingualTitle(
      project.ckbContent?.title,
      project.kmrContent?.title,
    ),
    subtitle:
      project.projectTypeCkb?.trim() ||
      project.projectTypeKmr?.trim() ||
      project.ckbContent?.location?.trim() ||
      null,
    coverUrl:
      project.coverUrl?.trim() ||
      project.coverThumbnailUrl?.trim() ||
      null,
    featureImageUrl: project.featureImageUrl?.trim() || null,
    coverAspect: "wide",
    featured: !!project.featured,
    featuredOrder: project.featuredOrder,
    canFeature: true,
    strictImage: false,
    detailHref: `/dashboard/projects/${project.id}`,
    editHref: `/dashboard/projects/${project.id}/edit`,
  }
}

/**
 * What a service's slide falls back to when no hero is set, resolved exactly
 * the way the backend does it: first gallery slot — an image slot's `url`, a
 * video slot's `posterUrl` — then the legacy list, then the hero poster.
 *
 * The distinction from `galleryPreviewUrl` matters: that one falls back to a
 * video's own URL when it has no poster, which is fine for an admin thumbnail
 * but is *not* an image the carousel can use. Counting it here would let the
 * UI green-light a service the backend then rejects.
 */
function serviceSlideFallbackImage(service: ServiceDto): string | null {
  for (const slot of service.galleryMedia ?? []) {
    const candidate =
      slot.type === "VIDEO" ? slot.posterUrl?.trim() : slot.url?.trim()
    if (candidate) return candidate
  }
  // Stops where the backend's chain stops. `thumbnailUrls` is deliberately not
  // consulted: counting it would enable Add and hide the hero picker for a
  // service the backend then rejects.
  return (
    service.featureImageUrls?.[0]?.trim() ||
    service.heroPosterUrl?.trim() ||
    null
  )
}

export function mapServiceToCatalogItem(
  service: ServiceDto,
): FeaturedCatalogItem | null {
  if (!service.id) return null
  const titleCkb = getServiceContent(service, "CKB")?.title ?? ""
  const titleKmr = getServiceContent(service, "KMR")?.title ?? ""
  return {
    key: `services-${service.id}`,
    id: service.id,
    category: "services",
    categoryLabel: FEATURED_CATEGORY_LABELS.services,
    title: bilingualTitle(titleCkb, titleKmr),
    subtitle:
      service.navAnchorId?.trim() ||
      service.serviceType?.trim() ||
      service.location?.trim() ||
      null,
    coverUrl: serviceSlideFallbackImage(service),
    featureImageUrl: service.featureImageUrl?.trim() || null,
    coverAspect: "square",
    featured: !!service.featured,
    featuredOrder: service.featuredOrder,
    canFeature: true,
    // A service with no gallery image at all is rejected outright.
    strictImage: true,
    detailHref: `/dashboard/services/${service.id}`,
    editHref: `/dashboard/services/${service.id}/edit`,
  }
}

/**
 * About carries no cover of any kind — every picture lives inline in the Tiptap
 * body — so `coverUrl` stays null and the hero is the slide's only possible
 * image. That is why `strictImage` matters most here.
 */
export function mapAboutToCatalogItem(
  about: AboutDto,
): FeaturedCatalogItem | null {
  if (!about.id) return null
  return {
    key: `about-${about.id}`,
    id: about.id,
    category: "about",
    categoryLabel: FEATURED_CATEGORY_LABELS.about,
    title: bilingualTitle(about.ckbContent?.title, about.kmrContent?.title),
    subtitle:
      about.ckbContent?.subtitle?.trim() ||
      about.kmrContent?.subtitle?.trim() ||
      about.ckbContent?.metaDescription?.trim() ||
      about.kmrContent?.metaDescription?.trim() ||
      null,
    coverUrl: null,
    featureImageUrl: about.featureImageUrl?.trim() || null,
    coverAspect: "wide",
    featured: !!about.featured,
    featuredOrder: about.featuredOrder,
    canFeature: true,
    strictImage: true,
    detailHref: `/dashboard/about/${about.id}`,
    editHref: `/dashboard/about/${about.id}/edit`,
  }
}

/**
 * The donation page is a singleton: one row, no list, at most one slide. Both
 * hrefs point at the same settings screen because there is nothing to drill
 * into.
 */
export function mapDonationToCatalogItem(
  settings: DonationSettingsDto | null | undefined,
): FeaturedCatalogItem | null {
  if (!settings) return null
  const id = settings.id ?? DONATION_SINGLETON_ID
  return {
    key: `donation-${id}`,
    id,
    category: "donation",
    categoryLabel: FEATURED_CATEGORY_LABELS.donation,
    title: bilingualTitle(settings.titleCkb, settings.titleKmr),
    subtitle:
      settings.descriptionCkb?.trim() ||
      settings.descriptionKmr?.trim() ||
      null,
    coverUrl: settings.heroImageUrl?.trim() || null,
    featureImageUrl: settings.featureImageUrl?.trim() || null,
    coverAspect: "wide",
    featured: !!settings.featured,
    featuredOrder: settings.featuredOrder,
    canFeature: true,
    strictImage: true,
    detailHref: "/dashboard/donations",
    editHref: "/dashboard/donations",
  }
}

export function mapVideoToCatalogItem(video: VideoDto): FeaturedCatalogItem | null {
  if (!video.id) return null
  return {
    key: `videos-${video.id}`,
    id: video.id,
    category: "videos",
    categoryLabel: FEATURED_CATEGORY_LABELS.videos,
    title: bilingualTitle(video.ckbContent?.title, video.kmrContent?.title),
    subtitle:
      video.topicNameCkb?.trim() ||
      video.topicNameKmr?.trim() ||
      video.ckbContent?.director?.trim() ||
      null,
    coverUrl: bilingualCover(
      video.ckbCoverUrl,
      video.kmrCoverUrl,
      video.hoverCoverUrl,
    ),
    featureImageUrl: video.featureImageUrl?.trim() || null,
    coverAspect: "wide",
    featured: !!video.featured,
    featuredOrder: video.featuredOrder,
    canFeature: true,
    strictImage: false,
    detailHref: `/dashboard/videos/${video.id}`,
    editHref: `/dashboard/videos/${video.id}/edit`,
  }
}

export function mapSoundToCatalogItem(sound: SoundDto): FeaturedCatalogItem | null {
  if (!sound.id) return null
  return {
    key: `sounds-${sound.id}`,
    id: sound.id,
    category: "sounds",
    categoryLabel: FEATURED_CATEGORY_LABELS.sounds,
    title: bilingualTitle(sound.ckbContent?.title, sound.kmrContent?.title),
    subtitle:
      sound.topicNameCkb?.trim() ||
      sound.topicNameKmr?.trim() ||
      sound.soundType?.trim() ||
      null,
    coverUrl: bilingualCover(
      sound.ckbCoverUrl,
      sound.kmrCoverUrl,
      sound.hoverCoverUrl,
    ),
    featureImageUrl: sound.featureImageUrl?.trim() || null,
    coverAspect: "square",
    featured: !!sound.featured,
    featuredOrder: sound.featuredOrder,
    canFeature: true,
    strictImage: false,
    detailHref: `/dashboard/sounds/${sound.id}`,
    editHref: `/dashboard/sounds/${sound.id}/edit`,
  }
}

export function mapCollectionToCatalogItem(
  collection: CollectionDto,
): FeaturedCatalogItem | null {
  if (!collection.id) return null
  return {
    key: `collections-${collection.id}`,
    id: collection.id,
    category: "collections",
    categoryLabel: FEATURED_CATEGORY_LABELS.collections,
    title: bilingualTitle(
      collection.ckbContent?.title,
      collection.kmrContent?.title,
    ),
    subtitle:
      collection.topicNameCkb?.trim() ||
      collection.topicNameKmr?.trim() ||
      collection.ckbContent?.location?.trim() ||
      null,
    coverUrl: bilingualCover(
      collection.ckbCoverUrl,
      collection.kmrCoverUrl,
      collection.hoverCoverUrl,
    ),
    featureImageUrl: collection.featureImageUrl?.trim() || null,
    coverAspect: "wide",
    featured: !!collection.featured,
    featuredOrder: collection.featuredOrder,
    canFeature: true,
    strictImage: false,
    detailHref: `/dashboard/image-collections/${collection.id}`,
    editHref: `/dashboard/image-collections/${collection.id}/edit`,
  }
}

export function mapWritingToCatalogItem(
  writing: WritingDto,
): FeaturedCatalogItem | null {
  if (!writing.id) return null
  return {
    key: `writings-${writing.id}`,
    id: writing.id,
    category: "writings",
    categoryLabel: FEATURED_CATEGORY_LABELS.writings,
    title: bilingualTitle(writing.ckbContent?.title, writing.kmrContent?.title),
    subtitle:
      writing.ckbContent?.writer?.trim() ||
      writing.kmrContent?.writer?.trim() ||
      writing.topicNameCkb?.trim() ||
      writing.topicNameKmr?.trim() ||
      null,
    coverUrl: bilingualCover(
      writing.ckbCoverUrl,
      writing.kmrCoverUrl,
      writing.hoverCoverUrl,
    ),
    featureImageUrl: writing.featureImageUrl?.trim() || null,
    coverAspect: "book",
    featured: !!writing.featured,
    featuredOrder: writing.featuredOrder,
    canFeature: true,
    strictImage: false,
    detailHref: `/dashboard/writings/${writing.id}`,
    editHref: `/dashboard/writings/${writing.id}/edit`,
  }
}

export function filterCatalogItems(
  items: FeaturedCatalogItem[],
  {
    search,
    category,
    status,
  }: {
    search: string
    category: FeaturedCatalogCategory
    status: FeaturedCatalogStatusFilter
  },
): FeaturedCatalogItem[] {
  const q = search.trim().toLowerCase()
  return items.filter((item) => {
    if (category !== "all" && item.category !== category) return false
    if (status === "featured" && !item.featured) return false
    if (status === "not_featured" && item.featured) return false
    if (!q) return true
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q)
    )
  })
}

export function countFeaturedByCategory(
  items: FeaturedCatalogItem[],
): Record<Exclude<FeaturedCatalogCategory, "all">, number> {
  const counts = {
    news: 0,
    projects: 0,
    services: 0,
    videos: 0,
    sounds: 0,
    collections: 0,
    writings: 0,
    about: 0,
    donation: 0,
  }
  for (const item of items) {
    if (item.featured) counts[item.category] += 1
  }
  return counts
}
