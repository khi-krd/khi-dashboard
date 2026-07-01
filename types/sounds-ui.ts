import type { Language, SoundDto } from "@/types/sounds"

export type SoundsUiStateFilter =
  | "all"
  | "single"
  | "multi"
  | "album_of_memories"

export type SoundsUiLanguageFilter =
  | "all"
  | "ckb_only"
  | "kmr_only"
  | "both"

export type SoundsListQueryKeyParts = {
  page: number
  size: number
  keyword: string
  stateFilter: SoundsUiStateFilter
  typeFilter: string | null
  topicId: number | null
  languageFilter: SoundsUiLanguageFilter
}

export type SoundAdminTableRow = SoundDto & {
  fileCount: number
  titleCkb: string
  titleKmr: string
  sortTitleCkb: string
  sortDuration: number
  sortCreated: number
}

function sumDurationSeconds(s: SoundDto): number {
  return (s.files ?? []).reduce(
    (acc, f) => acc + (f.durationSeconds ?? 0),
    0,
  )
}

export function toSoundAdminRow(s: SoundDto): SoundAdminTableRow {
  const titleCkb = s.ckbContent?.title ?? ""
  const titleKmr = s.kmrContent?.title ?? ""
  const created = s.createdAt ? new Date(s.createdAt).getTime() : 0
  return {
    ...s,
    fileCount: s.files?.length ?? 0,
    titleCkb,
    titleKmr,
    sortTitleCkb: titleCkb.trim().toLowerCase(),
    sortDuration: sumDurationSeconds(s),
    sortCreated: Number.isFinite(created) ? created : 0,
  }
}

export function matchesSoundStateFilter(
  s: SoundDto,
  filter: SoundsUiStateFilter,
): boolean {
  if (filter === "all" || filter === "album_of_memories") return true
  if (filter === "single") return s.trackState === "SINGLE"
  if (filter === "multi") return s.trackState === "MULTI"
  return true
}

export function matchesSoundTypeFilter(
  s: SoundDto,
  type: string | null,
): boolean {
  if (!type) return true
  return (s.soundType ?? "").trim() === type
}

export function matchesSoundTopicFilter(
  s: SoundDto,
  topicId: number | null,
): boolean {
  if (topicId == null) return true
  return s.topicId === topicId
}

export function matchesSoundLanguageFilter(
  s: SoundDto,
  filter: SoundsUiLanguageFilter,
): boolean {
  const langs = normalizeLanguages(s.contentLanguages)
  const hasCkb = langs.includes("CKB")
  const hasKmr = langs.includes("KMR")
  if (filter === "all") return true
  if (filter === "ckb_only") return hasCkb && !hasKmr
  if (filter === "kmr_only") return hasKmr && !hasCkb
  if (filter === "both") return hasCkb && hasKmr
  return true
}

export function matchesSoundClientSearchFilter(
  s: SoundDto,
  q: string | null,
): boolean {
  const k = q?.trim().toLowerCase()
  if (!k || k.length < 2) return true
  const haystack = [
    s.ckbContent?.title,
    s.kmrContent?.title,
    s.soundType,
    ...(s.tagsCkb ?? []),
    ...(s.tagsKmr ?? []),
    ...(s.keywordsCkb ?? []),
    ...(s.keywordsKmr ?? []),
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

export function getSoundTitleCkb(s: SoundDto): string {
  return s.ckbContent?.title?.trim() ?? ""
}

export function getSoundTitleKmr(s: SoundDto): string {
  return s.kmrContent?.title?.trim() ?? ""
}

export function getFirstPlayableUrl(s: SoundDto): string | null {
  const first = s.files?.[0]
  if (!first) return null
  return first.fileUrl?.trim() || null
}

export function deriveDistinctSoundTypes(sounds: SoundDto[]): string[] {
  const set = new Set<string>()
  for (const s of sounds) {
    const t = s.soundType?.trim()
    if (t) set.add(t)
  }
  return [...set].sort((a, b) => a.localeCompare(b, "ckb"))
}
