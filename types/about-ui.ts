import type { AboutDto, AboutStatus, Language } from "@/types/about"

export type AboutUiStatusFilter = "all" | AboutStatus
export type AboutUiLanguageFilter = "all" | Language

export type AboutAdminTableRow = AboutDto & {
  sortUpdatedAt: number
}

export function toAboutAdminRow(dto: AboutDto): AboutAdminTableRow {
  const t = dto.updatedAt
    ? new Date(dto.updatedAt).getTime()
    : dto.createdAt
      ? new Date(dto.createdAt).getTime()
      : 0
  return {
    ...dto,
    sortUpdatedAt: Number.isFinite(t) ? t : 0,
  }
}

export function matchesAboutStatusFilter(
  row: AboutDto,
  filter: AboutUiStatusFilter,
): boolean {
  if (filter === "all") return true
  return row.status === filter
}

export function matchesAboutLanguageFilter(
  row: AboutDto,
  filter: AboutUiLanguageFilter,
): boolean {
  if (filter === "all") return true
  return row.contentLanguages?.includes(filter) ?? false
}

export function matchesAboutClientSearchFilter(
  row: AboutDto,
  keyword: string,
): boolean {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return true
  const hay = [
    row.titleCkb,
    row.titleKmr,
    row.subtitleCkb,
    row.subtitleKmr,
    row.slugCkb,
    row.slugKmr,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return hay.includes(kw)
}

export function aboutContentLanguages(row: AboutDto): Language[] {
  const langs = row.contentLanguages ?? []
  if (langs.length) return langs
  const out: Language[] = []
  if (row.titleCkb?.trim() || row.slugCkb?.trim()) out.push("CKB")
  if (row.titleKmr?.trim() || row.slugKmr?.trim()) out.push("KMR")
  return out.length ? out : ["CKB"]
}
