import { unwrapApiData } from "@/lib/about-normalize"
import {
  isDonationStatus,
  type ArchiveDonationDto,
  type ArchiveMaterialType,
  type DonationPage,
  type DonationSettingsDto,
  type DonationStatus,
  type DonationTypeCode,
  type DonationTypeDto,
  type FinancialDonationDto,
} from "@/types/donations"

function coerceStr(v: unknown): string | null {
  if (v == null) return null
  if (typeof v === "string") return v
  return String(v)
}

function coerceNum(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function coerceBool(v: unknown, fallback = true): boolean {
  if (typeof v === "boolean") return v
  if (v === "true" || v === true) return true
  if (v === "false" || v === false) return false
  return fallback
}

const MATERIAL_TYPES = new Set<ArchiveMaterialType>([
  "PHOTOGRAPH",
  "MANUSCRIPT",
  "DOCUMENT",
  "AUDIO",
  "VIDEO",
  "OTHER",
])

const TYPE_CODES = new Set<DonationTypeCode>(["FINANCIAL", "ARCHIVE"])

function normalizeMaterialType(v: unknown): ArchiveMaterialType | null {
  const s = coerceStr(v)?.toUpperCase()
  if (s && MATERIAL_TYPES.has(s as ArchiveMaterialType)) {
    return s as ArchiveMaterialType
  }
  return null
}

function normalizeStatus(v: unknown): DonationStatus {
  const s = coerceStr(v)?.toUpperCase()
  if (s && isDonationStatus(s)) return s
  return "PENDING"
}

function normalizeTypeCode(v: unknown): DonationTypeCode | null {
  const s = coerceStr(v)?.toUpperCase()
  if (s && TYPE_CODES.has(s as DonationTypeCode)) return s as DonationTypeCode
  return null
}

export function normalizeDonationSettingsDto(raw: unknown): DonationSettingsDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  return {
    id: coerceNum(o.id) ?? undefined,
    titleCkb: coerceStr(o.titleCkb) ?? coerceStr(o.title_ckb),
    titleKmr: coerceStr(o.titleKmr) ?? coerceStr(o.title_kmr),
    descriptionCkb: coerceStr(o.descriptionCkb) ?? coerceStr(o.description_ckb),
    descriptionKmr: coerceStr(o.descriptionKmr) ?? coerceStr(o.description_kmr),
    heroImageUrl: coerceStr(o.heroImageUrl) ?? coerceStr(o.hero_image_url),
    bankName: coerceStr(o.bankName) ?? coerceStr(o.bank_name),
    accountName: coerceStr(o.accountName) ?? coerceStr(o.account_name),
    accountNumber: coerceStr(o.accountNumber) ?? coerceStr(o.account_number),
    iban: coerceStr(o.iban),
    swiftCode: coerceStr(o.swiftCode) ?? coerceStr(o.swift_code),
    paymentInstructionsCkb:
      coerceStr(o.paymentInstructionsCkb) ?? coerceStr(o.payment_instructions_ckb),
    paymentInstructionsKmr:
      coerceStr(o.paymentInstructionsKmr) ?? coerceStr(o.payment_instructions_kmr),
    financialDonationsEnabled: coerceBool(
      o.financialDonationsEnabled ?? o.financial_donations_enabled,
      true,
    ),
    archiveDonationsEnabled: coerceBool(
      o.archiveDonationsEnabled ?? o.archive_donations_enabled,
      true,
    ),
  }
}

export function normalizeDonationTypeDto(raw: unknown): DonationTypeDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const code = normalizeTypeCode(o.code)
  if (!code) return null
  return {
    code,
    titleCkb: coerceStr(o.titleCkb) ?? coerceStr(o.title_ckb),
    titleKmr: coerceStr(o.titleKmr) ?? coerceStr(o.title_kmr),
    enabled: coerceBool(o.enabled, true),
  }
}

export function normalizeDonationTypes(raw: unknown): DonationTypeDto[] {
  const unwrapped = unwrapApiData<unknown>(raw)
  const list = Array.isArray(unwrapped) ? unwrapped : []
  return list.map(normalizeDonationTypeDto).filter((t): t is DonationTypeDto => t != null)
}

export function normalizeArchiveDonationDto(raw: unknown): ArchiveDonationDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  return {
    id: coerceNum(o.id) ?? undefined,
    donorName: coerceStr(o.donorName) ?? coerceStr(o.donor_name),
    email: coerceStr(o.email),
    phone: coerceStr(o.phone),
    materialType: normalizeMaterialType(o.materialType ?? o.material_type),
    title: coerceStr(o.title),
    description: coerceStr(o.description),
    estimatedDate: coerceStr(o.estimatedDate) ?? coerceStr(o.estimated_date),
    attachmentUrl: coerceStr(o.attachmentUrl) ?? coerceStr(o.attachment_url),
    status: normalizeStatus(o.status),
    createdAt: coerceStr(o.createdAt) ?? coerceStr(o.created_at) ?? undefined,
    updatedAt: coerceStr(o.updatedAt) ?? coerceStr(o.updated_at) ?? undefined,
  }
}

export function normalizeFinancialDonationDto(raw: unknown): FinancialDonationDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  return {
    id: coerceNum(o.id) ?? undefined,
    donorName: coerceStr(o.donorName) ?? coerceStr(o.donor_name),
    email: coerceStr(o.email),
    phone: coerceStr(o.phone),
    amount: coerceNum(o.amount),
    currency: coerceStr(o.currency),
    paymentMethod: coerceStr(o.paymentMethod) ?? coerceStr(o.payment_method),
    transactionReference:
      coerceStr(o.transactionReference) ?? coerceStr(o.transaction_reference),
    message: coerceStr(o.message),
    status: normalizeStatus(o.status),
    createdAt: coerceStr(o.createdAt) ?? coerceStr(o.created_at) ?? undefined,
    updatedAt: coerceStr(o.updatedAt) ?? coerceStr(o.updated_at) ?? undefined,
  }
}

function normalizeDonationPage<T>(
  raw: unknown,
  mapItem: (item: unknown) => T,
): DonationPage<T> {
  const unwrapped = unwrapApiData<unknown>(raw)
  const o = (unwrapped && typeof unwrapped === "object"
    ? unwrapped
    : {}) as Record<string, unknown>

  const contentRaw =
    o.content ?? o.items ?? (Array.isArray(unwrapped) ? unwrapped : [])
  const content = Array.isArray(contentRaw) ? contentRaw.map(mapItem) : []

  return {
    content,
    totalElements:
      coerceNum(o.totalElements) ?? coerceNum(o.total_elements) ?? content.length,
    totalPages: coerceNum(o.totalPages) ?? coerceNum(o.total_pages) ?? 1,
    number: coerceNum(o.number) ?? coerceNum(o.page) ?? 0,
    size: coerceNum(o.size) ?? content.length,
  }
}

export function normalizeArchiveDonationPage(raw: unknown): DonationPage<ArchiveDonationDto> {
  return normalizeDonationPage(raw, normalizeArchiveDonationDto)
}

export function normalizeFinancialDonationPage(
  raw: unknown,
): DonationPage<FinancialDonationDto> {
  return normalizeDonationPage(raw, normalizeFinancialDonationDto)
}
