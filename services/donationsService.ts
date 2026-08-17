import api from "@/lib/axios"
import { unwrapApiData } from "@/lib/about-normalize"
import {
  normalizeArchiveDonationDto,
  normalizeArchiveDonationPage,
  normalizeDonationSettingsDto,
  normalizeDonationTypes,
  normalizeFinancialDonationDto,
  normalizeFinancialDonationPage,
} from "@/lib/donations-normalize"
import type {
  ArchiveDonationDto,
  DonationPage,
  DonationSettingsDto,
  DonationStatus,
  DonationTypeDto,
  FinancialDonationDto,
} from "@/types/donations"
import type { FeaturedPayload } from "@/types/featured"

const BASE = "/api/v1/donations"

export async function getDonationSettings(): Promise<DonationSettingsDto | null> {
  try {
    const { data } = await api.get<unknown>(`${BASE}/settings`)
    const dto = normalizeDonationSettingsDto(unwrapApiData(data))
    return dto
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404) return null
    throw err
  }
}

export async function updateDonationSettings(
  payload: DonationSettingsDto,
): Promise<DonationSettingsDto> {
  const { data } = await api.put<unknown>(`${BASE}/settings`, payload, {
    headers: { "Content-Type": "application/json" },
  })
  return normalizeDonationSettingsDto(unwrapApiData(data))
}

/**
 * The singleton's featured toggle — no id, and unlike the other eight it
 * answers `200` with the whole saved settings rather than `204`, so the
 * donation screen can re-render straight from the response.
 *
 * Rejects with `400` when both `featureImageUrl` and `heroImageUrl` are blank,
 * or when the settings row has never been saved.
 */
export async function patchDonationSettingsFeatured(
  payload: FeaturedPayload,
): Promise<DonationSettingsDto> {
  const { data } = await api.patch<unknown>(`${BASE}/settings/featured`, payload)
  return normalizeDonationSettingsDto(unwrapApiData(data))
}

export async function getDonationTypes(): Promise<DonationTypeDto[]> {
  const { data } = await api.get<unknown>(`${BASE}/types`)
  return normalizeDonationTypes(data)
}

export async function getArchiveDonationsList(
  page: number,
  size: number,
): Promise<DonationPage<ArchiveDonationDto>> {
  const { data } = await api.get<unknown>(`${BASE}/archive`, {
    params: { page, size },
  })
  return normalizeArchiveDonationPage(data)
}

export async function updateArchiveDonationStatus(
  id: number,
  status: DonationStatus,
): Promise<ArchiveDonationDto> {
  const { data } = await api.patch<unknown>(`${BASE}/archive/${id}/status`, {
    status,
  })
  return normalizeArchiveDonationDto(unwrapApiData(data))
}

export async function getFinancialDonationsList(
  page: number,
  size: number,
): Promise<DonationPage<FinancialDonationDto>> {
  const { data } = await api.get<unknown>(`${BASE}/financial`, {
    params: { page, size },
  })
  return normalizeFinancialDonationPage(data)
}

export async function updateFinancialDonationStatus(
  id: number,
  status: DonationStatus,
): Promise<FinancialDonationDto> {
  const { data } = await api.patch<unknown>(`${BASE}/financial/${id}/status`, {
    status,
  })
  return normalizeFinancialDonationDto(unwrapApiData(data))
}
