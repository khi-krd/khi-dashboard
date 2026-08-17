import api from "@/lib/axios"
import type { AboutWritePayload } from "@/lib/about-form-data"
import {
  normalizeAboutPartner,
  normalizeAboutTeamMember,
  normalizeAboutDto,
  normalizeAboutPage,
  unwrapApiData,
} from "@/lib/about-normalize"
import type {
  AboutDto,
  AboutPage,
  AboutPartnerDto,
  AboutTeamMemberDto,
} from "@/types/about"
import type { FeaturedPayload } from "@/types/featured"

const BASE = "/api/v1/about"

export async function getAboutList(
  page: number,
  size: number,
): Promise<AboutPage> {
  const { data } = await api.get<unknown>(BASE, { params: { page, size } })
  return normalizeAboutPage(data)
}

export async function getAboutById(id: number): Promise<AboutDto | null> {
  try {
    const { data } = await api.get<unknown>(`${BASE}/${id}`)
    const dto = normalizeAboutDto(unwrapApiData(data))
    return dto.id ? dto : null
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404 || status === 405) return null
    throw err
  }
}

export async function createAbout(payload: AboutWritePayload): Promise<AboutDto> {
  const { data } = await api.post<unknown>(BASE, payload, {
    headers: { "Content-Type": "application/json" },
  })
  return normalizeAboutDto(unwrapApiData(data))
}

export async function updateAbout(
  id: number,
  payload: AboutWritePayload,
): Promise<AboutDto> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  })
  return normalizeAboutDto(unwrapApiData(data))
}

export async function deleteAbout(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}

/**
 * `204 No Content`. The only writer of `featured` / `featuredOrder` /
 * `featureImageUrl` — the About PUT is a full-replace save and ignores them.
 *
 * Rejects with `400` when `featureImageUrl` is blank on the record and none is
 * sent: About has no cover to fall back on, so the slide would silently never
 * render (`details.reason` carries the explanation).
 */
export async function patchAboutFeatured(
  id: number,
  payload: FeaturedPayload,
): Promise<void> {
  await api.patch(`${BASE}/${id}/featured`, payload)
}

const FEATURED_ABOUT_SCAN_SIZE = 200

/**
 * About has no `GET /featured` route of its own, so the featured set is read by
 * scanning the list. The global slide cap keeps the real count in single
 * digits, and About pages number a handful, so one page covers it.
 */
export async function getFeaturedAboutPages(): Promise<AboutDto[]> {
  const page = await getAboutList(0, FEATURED_ABOUT_SCAN_SIZE)
  return page.content.filter((dto) => dto.featured && dto.id != null)
}

type AboutTeamPayload = {
  nameCkb?: string | null
  nameKmr?: string | null
  roleCkb?: string | null
  roleKmr?: string | null
  bioCkb?: string | null
  bioKmr?: string | null
  office?: string | null
  imageUrl?: string | null
  displayOrder?: number
  active?: boolean
}

type AboutPartnerPayload = {
  nameCkb?: string | null
  nameKmr?: string | null
  descriptionCkb?: string | null
  descriptionKmr?: string | null
  logoUrl?: string | null
  websiteUrl?: string | null
  displayOrder?: number
  active?: boolean
}

export async function getAboutTeamMembers(): Promise<AboutTeamMemberDto[]> {
  const { data } = await api.get<unknown>(`${BASE}/team`)
  const unwrapped = unwrapApiData<unknown>(data)
  if (!Array.isArray(unwrapped)) return []
  return unwrapped.map(normalizeAboutTeamMember)
}

export async function createAboutTeamMember(
  payload: AboutTeamPayload,
): Promise<AboutTeamMemberDto> {
  const { data } = await api.post<unknown>(`${BASE}/team`, payload, {
    headers: { "Content-Type": "application/json" },
  })
  return normalizeAboutTeamMember(unwrapApiData(data))
}

export async function updateAboutTeamMember(
  id: number,
  payload: AboutTeamPayload,
): Promise<AboutTeamMemberDto> {
  const { data } = await api.put<unknown>(`${BASE}/team/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  })
  return normalizeAboutTeamMember(unwrapApiData(data))
}

export async function deleteAboutTeamMember(id: number): Promise<void> {
  await api.delete(`${BASE}/team/${id}`)
}

export async function getAboutPartners(): Promise<AboutPartnerDto[]> {
  const { data } = await api.get<unknown>(`${BASE}/partners`)
  const unwrapped = unwrapApiData<unknown>(data)
  if (!Array.isArray(unwrapped)) return []
  return unwrapped.map(normalizeAboutPartner)
}

export async function createAboutPartner(
  payload: AboutPartnerPayload,
): Promise<AboutPartnerDto> {
  const { data } = await api.post<unknown>(`${BASE}/partners`, payload, {
    headers: { "Content-Type": "application/json" },
  })
  return normalizeAboutPartner(unwrapApiData(data))
}

export async function updateAboutPartner(
  id: number,
  payload: AboutPartnerPayload,
): Promise<AboutPartnerDto> {
  const { data } = await api.put<unknown>(`${BASE}/partners/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  })
  return normalizeAboutPartner(unwrapApiData(data))
}

export async function deleteAboutPartner(id: number): Promise<void> {
  await api.delete(`${BASE}/partners/${id}`)
}
