import type { Language, NewsDto } from "@/types/news"

export type NewsUiStatusFilter =
  | "all"
  | "published"
  | "draft"
  | "scheduled"
  | "archived"

export type NewsUiLanguageFilter = "all" | "ckb_only" | "kmr_only" | "both"

export type NewsListQueryKeyParts = {
  page: number
  size: number
  /** Trimmed keyword; determines list vs search on the server. */
  keyword: string
}

export function newsRowStatus(
  n: Pick<NewsDto, "datePublished">,
): "published" | "scheduled" | "draft" | "archived" {
  const iso = n.datePublished
  if (!iso) return "draft"
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return "draft"
  if (t > Date.now()) return "scheduled"
  return "published"
}

export function matchesNewsStatusFilter(
  n: NewsDto,
  filter: NewsUiStatusFilter,
): boolean {
  if (filter === "all") return true
  /* Draft/archive are placeholders until backend fields exist — no client filtering. */
  if (filter === "draft" || filter === "archived") return true
  const s = newsRowStatus(n)
  if (filter === "published") return s === "published"
  if (filter === "scheduled") return s === "scheduled"
  return true
}

export function matchesNewsLanguageFilter(
  n: NewsDto,
  filter: NewsUiLanguageFilter,
): boolean {
  const langs = n.contentLanguages ?? []
  const hasCkb = langs.includes("CKB" as Language)
  const hasKmr = langs.includes("KMR" as Language)
  if (filter === "all") return true
  if (filter === "ckb_only") return hasCkb && !hasKmr
  if (filter === "kmr_only") return hasKmr && !hasCkb
  if (filter === "both") return hasCkb && hasKmr
  return true
}

export function matchesNewsCategoryFilter(
  n: NewsDto,
  categoryCkbKey: string | null,
): boolean {
  if (!categoryCkbKey) return true
  return n.category?.ckbName === categoryCkbKey
}

export function matchesNewsSubcategoryFilter(
  n: NewsDto,
  subcategoryCkbKey: string | null,
): boolean {
  if (!subcategoryCkbKey?.trim()) return true
  return n.subCategory?.ckbName === subcategoryCkbKey
}

function trimmedEq(a: string, b: string) {
  return a.trim() === b.trim()
}

/** Client-side tag filter when `tag` appears in CKB/KMR lists. */
export function matchesNewsClientTagFilter(n: NewsDto, tag: string | null): boolean {
  const t = tag?.trim()
  if (!t) return true
  const inList = [...(n.tags?.ckb ?? []), ...(n.tags?.kmr ?? [])].some((x) =>
    trimmedEq(x, t),
  )
  return inList
}

export function matchesNewsClientKeywordFilter(
  n: NewsDto,
  keyword: string | null,
): boolean {
  const k = keyword?.trim()
  if (!k) return true
  return [...(n.keywords?.ckb ?? []), ...(n.keywords?.kmr ?? [])].some((x) =>
    trimmedEq(x, k),
  )
}

export function deriveCategoryOptions(rows: NewsDto[]) {
  const map = new Map<string, { ckbName: string; kmrName: string }>()
  for (const n of rows) {
    const c = n.category
    if (c?.ckbName?.trim())
      map.set(c.ckbName, { ckbName: c.ckbName, kmrName: c.kmrName ?? "" })
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ckb"))
    .map(([, v]) => v)
}

export function deriveSubcategoryOptions(rows: NewsDto[], categoryCkb: string | null) {
  if (!categoryCkb?.trim()) return []
  const map = new Map<string, { ckbName: string; kmrName: string }>()
  for (const n of rows) {
    if (n.category?.ckbName !== categoryCkb) continue
    const s = n.subCategory
    if (s?.ckbName?.trim())
      map.set(s.ckbName, { ckbName: s.ckbName, kmrName: s.kmrName ?? "" })
  }
  return [...map.values()].sort((a, b) =>
    a.ckbName.localeCompare(b.ckbName, "ckb"),
  )
}
