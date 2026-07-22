import type {
  ArchiveDonationDto,
  ArchiveMaterialType,
  DonationStatus,
  FinancialDonationDto,
} from "@/types/donations"

export type DonationUiStatusFilter = "all" | DonationStatus

export type DonationUiTab = "settings" | "archive" | "financial"

export type ArchiveDonationRow = ArchiveDonationDto & { id: number }

export type FinancialDonationRow = FinancialDonationDto & { id: number }

export function toArchiveDonationRow(dto: ArchiveDonationDto): ArchiveDonationRow | null {
  if (typeof dto.id !== "number" || !Number.isFinite(dto.id)) return null
  return { ...dto, id: dto.id }
}

export function toFinancialDonationRow(
  dto: FinancialDonationDto,
): FinancialDonationRow | null {
  if (typeof dto.id !== "number" || !Number.isFinite(dto.id)) return null
  return { ...dto, id: dto.id }
}

export function matchesDonationStatusFilter(
  status: DonationStatus | undefined,
  filter: DonationUiStatusFilter,
): boolean {
  if (filter === "all") return true
  return status === filter
}

export function matchesArchiveSearch(row: ArchiveDonationRow, keyword: string): boolean {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return true
  const haystack = [
    row.donorName,
    row.phone,
    row.email,
    row.title,
    row.description,
    row.materialType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(kw)
}

export function matchesFinancialSearch(
  row: FinancialDonationRow,
  keyword: string,
): boolean {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return true
  const haystack = [
    row.donorName,
    row.email,
    row.phone,
    row.currency,
    row.paymentMethod,
    row.amount != null ? String(row.amount) : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(kw)
}

export const ARCHIVE_MATERIAL_LABELS: Record<ArchiveMaterialType, string> = {
  PHOTOGRAPH: "وێنە",
  MANUSCRIPT: "دەستنووس",
  DOCUMENT: "بەڵگەنامە",
  AUDIO: "دەنگ",
  VIDEO: "ڤیدیۆ",
  OTHER: "هیتر",
}
