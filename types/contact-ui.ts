import type { ContactDto, Language } from "@/types/contact"

export type ContactUiActiveFilter = "all" | "active" | "inactive"

export type ContactUiLanguageFilter = "all" | Language

export type ContactAdminTableRow = ContactDto & {
  sortUpdatedAt: number
}

export function toContactAdminRow(dto: ContactDto): ContactAdminTableRow {
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

export function matchesContactActiveFilter(
  row: ContactDto,
  filter: ContactUiActiveFilter,
): boolean {
  if (filter === "all") return true
  if (filter === "active") return row.active === true
  if (filter === "inactive") return row.active === false
  return true
}

export function matchesContactLanguageFilter(
  row: ContactDto,
  filter: ContactUiLanguageFilter,
): boolean {
  if (filter === "all") return true
  return contactContentLanguages(row).includes(filter)
}

export function matchesContactClientSearchFilter(
  row: ContactDto,
  keyword: string,
): boolean {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return true
  const hay = [
    row.ckbContent?.title,
    row.kmrContent?.title,
    row.ckbContent?.address,
    row.kmrContent?.address,
    row.phone,
    row.email,
    row.slugCkb,
    row.slugKmr,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return hay.includes(kw)
}

export function contactContentLanguages(row: ContactDto): Language[] {
  const out: Language[] = []
  if (
    row.ckbContent?.title?.trim() ||
    row.slugCkb?.trim() ||
    row.ckbContent?.description?.trim()
  ) {
    out.push("CKB")
  }
  if (
    row.kmrContent?.title?.trim() ||
    row.slugKmr?.trim() ||
    row.kmrContent?.description?.trim()
  ) {
    out.push("KMR")
  }
  return out.length ? out : ["CKB"]
}
