import type {
  ServiceContentDto,
  ServiceDto,
  ServiceGalleryMediaDto,
  ServiceLayoutType,
} from "@/types/services"

import type { ServicesPageHeroFormValues } from "@/lib/validations/services-page"
import type { ServiceFormValues } from "@/lib/validations/services"

export const SERVICES_PAGE_HERO_ANCHOR = "page-hero"
export const DEFAULT_SECTION_SERVICE_TYPE = "services"
export const PAGE_HERO_SERVICE_TYPE = "page-hero"

function trimOrNull(v: string | null | undefined): string | null {
  const t = v?.trim()
  return t ? t : null
}

function buildGalleryMedia(
  slots: ServiceFormValues["galleryMedia"] | undefined,
): ServiceGalleryMediaDto[] {
  return (slots ?? [])
    .filter((slot) => slot.url?.trim())
    .map(({ type, url, posterUrl, alt }) => {
      const item: ServiceGalleryMediaDto = {
        type: type ?? "IMAGE",
        url: url.trim(),
      }
      const poster = trimOrNull(posterUrl)
      const altText = trimOrNull(alt)
      if (poster) item.posterUrl = poster
      if (altText) item.alt = altText
      return item
    })
}

function buildContents(values: ServiceFormValues): ServiceContentDto[] {
  const rows: ServiceContentDto[] = []
  for (const lang of values.contentLanguages) {
    const row = values.contents.find((c) => c.languageCode === lang)
    const title = row?.title?.trim() ?? ""
    if (!title) continue
    rows.push({
      ...(typeof row?.id === "number" ? { id: row.id } : {}),
      languageCode: lang,
      title,
      description: row?.description?.trim() ?? "",
    })
  }
  return rows
}

export type ServiceWritePayload = Omit<
  ServiceDto,
  "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "contentLanguages"
>

export function serviceFormValuesToPayload(
  mode: "create" | "edit",
  serviceId: number | undefined,
  values: ServiceFormValues,
  options?: {
    serviceType?: string
    navAnchorId?: string | null
    sortOrder?: number | null
    heroPosterUrl?: string | null
  },
): ServiceWritePayload {
  const contents = buildContents(values)
  const layoutType = (values.layoutType ?? "MEDIA_HERO") as ServiceLayoutType
  const galleryMedia = buildGalleryMedia(values.galleryMedia)

  const serviceType =
    trimOrNull(options?.serviceType) ??
    trimOrNull(values.serviceType) ??
    DEFAULT_SECTION_SERVICE_TYPE

  const navAnchorId =
    options?.navAnchorId !== undefined
      ? trimOrNull(options.navAnchorId)
      : trimOrNull(values.navAnchorId)

  const sortOrder =
    options?.sortOrder !== undefined
      ? options.sortOrder
      : typeof values.sortOrder === "number" && Number.isFinite(values.sortOrder)
        ? values.sortOrder
        : null

  const heroPosterUrl =
    options?.heroPosterUrl !== undefined
      ? trimOrNull(options.heroPosterUrl)
      : null

  return {
    ...(mode === "edit" && typeof serviceId === "number" ? { id: serviceId } : {}),
    serviceType,
    location: trimOrNull(values.location),
    layoutType,
    ...(navAnchorId ? { navAnchorId } : {}),
    ...(sortOrder != null ? { sortOrder } : {}),
    galleryMedia,
    heroVideoUrl: null,
    heroPosterUrl,
    featureImageUrls: [],
    thumbnailUrls: [],
    partnerIds: [...(values.partnerIds ?? [])],
    active: values.active,
    publishedAt: values.publishedAt ?? null,
    contents,
  }
}

export function heroFormValuesToServicePayload(
  values: ServicesPageHeroFormValues,
  existingId?: number,
): ServiceWritePayload {
  const trim = (v: string | undefined) => v?.trim() ?? ""
  const heroImage = trim(values.heroImageUrl)
  const titleCkb = trim(values.titleCkb)
  const titleKmr = trim(values.titleKmr)

  const contents: ServiceContentDto[] = []
  if (titleCkb) {
    contents.push({
      languageCode: "CKB",
      title: titleCkb,
      description: trim(values.subtitleCkb),
    })
  }
  if (titleKmr) {
    contents.push({
      languageCode: "KMR",
      title: titleKmr,
      description: trim(values.subtitleKmr),
    })
  }

  const eyebrowCkb = trim(values.eyebrowCkb)

  return {
    ...(typeof existingId === "number" ? { id: existingId } : {}),
    serviceType: PAGE_HERO_SERVICE_TYPE,
    location: trimOrNull(values.eyebrowKmr),
    layoutType: "MEDIA_HERO",
    navAnchorId: SERVICES_PAGE_HERO_ANCHOR,
    sortOrder: 0,
    heroPosterUrl: heroImage || null,
    heroVideoUrl: null,
    featureImageUrls: eyebrowCkb ? [eyebrowCkb] : [],
    thumbnailUrls: [],
    galleryMedia: heroImage ? [{ type: "IMAGE", url: heroImage }] : [],
    partnerIds: [],
    publishedAt: null,
    active: true,
    contents,
  }
}

export function isServicesPageHeroRecord(
  dto: Pick<ServiceDto, "navAnchorId" | "serviceType">,
): boolean {
  const anchor = dto.navAnchorId?.trim()
  if (anchor === SERVICES_PAGE_HERO_ANCHOR || anchor === "__page_hero__") {
    return true
  }
  return dto.serviceType?.trim() === PAGE_HERO_SERVICE_TYPE
}

export function splitPageHeroAndSections(records: ServiceDto[]): {
  hero: ServiceDto | undefined
  sections: ServiceDto[]
} {
  const hero = records.find(isServicesPageHeroRecord)
  const sections = records.filter((r) => !isServicesPageHeroRecord(r))
  return { hero, sections }
}

export function serviceDtoToHeroFormValues(
  dto: ServiceDto,
): ServicesPageHeroFormValues {
  const ckb = dto.contents.find((c) => c.languageCode === "CKB")
  const kmr = dto.contents.find((c) => c.languageCode === "KMR")
  const heroImageUrl =
    dto.heroPosterUrl?.trim() ||
    dto.galleryMedia?.find((g) => g.url?.trim())?.url?.trim() ||
    ""

  const legacyEyebrowCkb =
    dto.serviceType?.trim() === PAGE_HERO_SERVICE_TYPE
      ? ""
      : (dto.serviceType ?? "")

  return {
    heroImageUrl,
    eyebrowCkb: dto.featureImageUrls?.[0]?.trim() || legacyEyebrowCkb,
    eyebrowKmr: dto.location ?? "",
    titleCkb: ckb?.title ?? "",
    titleKmr: kmr?.title ?? "",
    subtitleCkb: ckb?.description ?? "",
    subtitleKmr: kmr?.description ?? "",
  }
}
