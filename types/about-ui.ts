import type { AboutDto, Language } from "@/types/about"

export type AboutUiActiveFilter = "all" | "active" | "inactive"

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

export function matchesAboutActiveFilter(
  row: AboutDto,
  filter: AboutUiActiveFilter,
): boolean {
  if (filter === "all") return true
  if (filter === "active") return row.active === true
  if (filter === "inactive") return row.active === false
  return true
}

export function matchesAboutLanguageFilter(
  row: AboutDto,
  filter: AboutUiLanguageFilter,
): boolean {
  if (filter === "all") return true
  return aboutContentLanguages(row).includes(filter)
}

export function matchesAboutClientSearchFilter(
  row: AboutDto,
  keyword: string,
): boolean {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return true
  const hay = [
    row.ckbContent?.title,
    row.kmrContent?.title,
    row.ckbContent?.subtitle,
    row.kmrContent?.subtitle,
    row.slugCkb,
    row.slugKmr,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return hay.includes(kw)
}

export function aboutContentLanguages(row: AboutDto): Language[] {
  const out: Language[] = []
  if (
    row.ckbContent?.title?.trim() ||
    row.slugCkb?.trim() ||
    row.ckbContent?.body?.trim()
  ) {
    out.push("CKB")
  }
  if (
    row.kmrContent?.title?.trim() ||
    row.slugKmr?.trim() ||
    row.kmrContent?.body?.trim()
  ) {
    out.push("KMR")
  }
  return out.length ? out : ["CKB"]
}
