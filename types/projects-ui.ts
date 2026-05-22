import type { Language, ProjectDto, ProjectStatus } from "@/types/projects"

export type ProjectsUiStatusFilter = "all" | "ongoing" | "completed"

export type ProjectsUiLanguageFilter =
  | "all"
  | "ckb_only"
  | "kmr_only"
  | "both"

export type ProjectsListQueryKeyParts = {
  page: number
  size: number
  keyword: string
  /** When set from deep link, prefer tag search endpoint */
  searchMode?: "tag" | "keyword" | "default"
}

export function matchesProjectStatusFilter(
  p: ProjectDto,
  filter: ProjectsUiStatusFilter,
): boolean {
  if (filter === "all") return true
  const s = p.status ?? "ONGOING"
  if (filter === "ongoing") return s === "ONGOING"
  if (filter === "completed") return s === "COMPLETED"
  return true
}

export function matchesProjectLanguageFilter(
  p: ProjectDto,
  filter: ProjectsUiLanguageFilter,
): boolean {
  const langs = p.contentLanguages ?? []
  const hasCkb = langs.includes("CKB" as Language)
  const hasKmr = langs.includes("KMR" as Language)
  if (filter === "all") return true
  if (filter === "ckb_only") return hasCkb && !hasKmr
  if (filter === "kmr_only") return hasKmr && !hasCkb
  if (filter === "both") return hasCkb && hasKmr
  return true
}

export function matchesProjectTypeFilter(
  p: ProjectDto,
  typeCkb: string | null,
): boolean {
  if (!typeCkb?.trim()) return true
  return (p.projectTypeCkb?.trim() ?? "") === typeCkb.trim()
}

function trimmedEq(a: string, b: string) {
  return a.trim() === b.trim()
}

export function matchesProjectClientTagFilter(
  p: ProjectDto,
  tag: string | null,
): boolean {
  const t = tag?.trim()
  if (!t) return true
  return [...(p.tagsCkb ?? []), ...(p.tagsKmr ?? [])].some((x) =>
    trimmedEq(x, t),
  )
}

export function matchesProjectClientKeywordFilter(
  p: ProjectDto,
  keyword: string | null,
): boolean {
  const k = keyword?.trim()
  if (!k) return true
  return [...(p.keywordsCkb ?? []), ...(p.keywordsKmr ?? [])].some((x) =>
    trimmedEq(x, k),
  )
}

/** Client-side title/tag/keyword search on current page */
export function matchesProjectClientSearchFilter(
  p: ProjectDto,
  q: string | null,
): boolean {
  const k = q?.trim().toLowerCase()
  if (!k || k.length < 2) return true
  const haystack = [
    p.ckbContent?.title,
    p.kmrContent?.title,
    ...(p.tagsCkb ?? []),
    ...(p.tagsKmr ?? []),
    ...(p.keywordsCkb ?? []),
    ...(p.keywordsKmr ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(k)
}

export function deriveProjectTypeOptions(rows: ProjectDto[]) {
  const map = new Map<string, { projectTypeCkb: string; projectTypeKmr: string }>()
  for (const p of rows) {
    const ckb = p.projectTypeCkb?.trim()
    if (!ckb) continue
    map.set(ckb, {
      projectTypeCkb: ckb,
      projectTypeKmr: p.projectTypeKmr?.trim() ?? "",
    })
  }
  return [...map.values()].sort((a, b) =>
    a.projectTypeCkb.localeCompare(b.projectTypeCkb, "ckb"),
  )
}

export type ProjectAdminTableRow = ProjectDto & {
  titleCkb: string
  titleKmr: string
  sortProjectDate: number
}

export function toProjectAdminRow(dto: ProjectDto): ProjectAdminTableRow {
  const titleCkb = dto.ckbContent?.title ?? ""
  const titleKmr = dto.kmrContent?.title ?? ""
  const t = dto.projectDate
    ? new Date(dto.projectDate).getTime()
    : dto.createdAt
      ? new Date(dto.createdAt).getTime()
      : 0
  return {
    ...dto,
    titleCkb,
    titleKmr,
    sortProjectDate: Number.isFinite(t) ? t : 0,
  }
}

export function projectStatusLabel(status: ProjectStatus | undefined): ProjectStatus {
  return status === "COMPLETED" ? "COMPLETED" : "ONGOING"
}
