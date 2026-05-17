import type { CollectionDto, CollectionType, Language } from "@/types/image-collections"

export type CollectionsUiTypeFilter = CollectionType | "all"

export type CollectionsUiLanguageFilter =
  | "all"
  | "ckb_only"
  | "kmr_only"
  | "both"

export type CollectionsListQueryKeyParts = {
  page: number
  size: number
  typeFilter: CollectionsUiTypeFilter
  topicId: number | null
  languageFilter: CollectionsUiLanguageFilter
}

export type CollectionAdminTableRow = CollectionDto & {
  itemCount: number
  titleCkb: string
  titleKmr: string
  sortTitleCkb: string
  sortDate: number
  sortItems: number
}

export function toCollectionAdminRow(c: CollectionDto): CollectionAdminTableRow {
  const titleCkb = c.ckbContent?.title ?? ""
  const titleKmr = c.kmrContent?.title ?? ""
  const date = c.publishmentDate ? new Date(c.publishmentDate).getTime() : 0
  return {
    ...c,
    itemCount: c.imageAlbum?.length ?? 0,
    titleCkb,
    titleKmr,
    sortTitleCkb: titleCkb.trim().toLowerCase(),
    sortDate: Number.isFinite(date) ? date : 0,
    sortItems: c.imageAlbum?.length ?? 0,
  }
}

export function matchesCollectionTypeFilter(
  c: CollectionDto,
  filter: CollectionsUiTypeFilter,
): boolean {
  if (filter === "all") return true
  return c.collectionType === filter
}

export function matchesCollectionTopicFilter(
  c: CollectionDto,
  topicId: number | null,
): boolean {
  if (topicId == null) return true
  return c.topicId === topicId
}

export function matchesCollectionLanguageFilter(
  c: CollectionDto,
  filter: CollectionsUiLanguageFilter,
): boolean {
  const langs = normalizeLanguages(c.contentLanguages)
  const hasCkb = langs.includes("CKB")
  const hasKmr = langs.includes("KMR")
  if (filter === "all") return true
  if (filter === "ckb_only") return hasCkb && !hasKmr
  if (filter === "kmr_only") return hasKmr && !hasCkb
  if (filter === "both") return hasCkb && hasKmr
  return true
}

/** Client-side search on current page only (no global search endpoint). */
export function matchesCollectionClientSearchFilter(
  c: CollectionDto,
  q: string | null,
): boolean {
  const k = q?.trim().toLowerCase()
  if (!k) return true
  const haystack = [
    c.ckbContent?.title,
    c.kmrContent?.title,
    c.ckbContent?.location,
    c.ckbContent?.collectedBy,
    ...(c.tagsCkb ?? []),
    ...(c.tagsKmr ?? []),
    ...(c.keywordsCkb ?? []),
    ...(c.keywordsKmr ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(k)
}

function normalizeLanguages(
  langs: Language[] | Set<Language> | undefined,
): Language[] {
  if (!langs) return []
  if (langs instanceof Set) return [...langs]
  return langs
}

export function getCollectionCoverUrl(c: CollectionDto): string | null {
  return (
    c.ckbCoverUrl?.trim() ||
    c.kmrCoverUrl?.trim() ||
    c.imageAlbum?.[0]?.imageUrl?.trim() ||
    c.imageAlbum?.[0]?.externalUrl?.trim() ||
    null
  )
}
