import type { ServiceDto, ServiceDisplayStatus } from "@/types/services"

export type ServicesUiStatusFilter = "all" | "published" | "draft"

export type ServicesUiActiveFilter = "all" | "active" | "inactive"

export type ServicesListQueryKeyParts = {
  page: number
  size: number
  keyword: string
}

export function serviceDisplayStatus(
  s: Pick<ServiceDto, "active" | "publishedAt">,
): ServiceDisplayStatus {
  if (!s.active) return "inactive"
  const iso = s.publishedAt
  if (!iso) return "draft"
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return "draft"
  if (t > Date.now()) return "scheduled"
  return "published"
}

export function matchesServicesStatusFilter(
  s: ServiceDto,
  filter: ServicesUiStatusFilter,
): boolean {
  if (filter === "all") return true
  const status = serviceDisplayStatus(s)
  if (filter === "published") {
    return status === "published" || status === "scheduled"
  }
  if (filter === "draft") {
    return status === "draft"
  }
  return true
}

export function matchesServicesActiveFilter(
  s: ServiceDto,
  filter: ServicesUiActiveFilter,
): boolean {
  if (filter === "all") return true
  if (filter === "active") return s.active === true
  if (filter === "inactive") return s.active === false
  return true
}

export function matchesServicesTypeFilter(
  s: ServiceDto,
  type: string | null,
): boolean {
  if (!type?.trim()) return true
  return (s.serviceType?.trim() ?? "") === type.trim()
}

export function matchesServicesClientSearchFilter(
  s: ServiceDto,
  q: string | null,
): boolean {
  const k = q?.trim().toLowerCase()
  if (!k || k.length < 2) return true
  const haystack = [
    ...s.contents.map((c) => c.title),
    s.serviceType,
    s.navAnchorId,
    s.location,
    s.layoutType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(k)
}

export function getServiceContent(
  s: ServiceDto,
  lang: "CKB" | "KMR",
): { title: string; description?: string | null } | null {
  return s.contents.find((c) => c.languageCode === lang) ?? null
}

export type ServiceAdminTableRow = ServiceDto & {
  titleCkb: string
  titleKmr: string
  sortPublishedAt: number
  sortOrderValue: number
}

export function toServiceAdminRow(dto: ServiceDto): ServiceAdminTableRow {
  const titleCkb = getServiceContent(dto, "CKB")?.title ?? ""
  const titleKmr = getServiceContent(dto, "KMR")?.title ?? ""
  const t = dto.publishedAt
    ? new Date(dto.publishedAt).getTime()
    : dto.createdAt
      ? new Date(dto.createdAt).getTime()
      : 0
  return {
    ...dto,
    titleCkb,
    titleKmr,
    sortPublishedAt: Number.isFinite(t) ? t : 0,
    sortOrderValue:
      typeof dto.sortOrder === "number" && Number.isFinite(dto.sortOrder)
        ? dto.sortOrder
        : Number.POSITIVE_INFINITY,
  }
}

export function deriveServiceTypeOptions(
  rows: ServiceDto[],
  apiTypes: string[],
): string[] {
  const set = new Set<string>()
  for (const t of apiTypes) {
    const v = t?.trim()
    if (v) set.add(v)
  }
  for (const row of rows) {
    const v = row.serviceType?.trim()
    if (v) set.add(v)
  }
  return [...set].sort((a, b) => a.localeCompare(b, "ku"))
}
