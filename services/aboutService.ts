import api from "@/lib/axios"
import type { AboutWritePayload } from "@/lib/about-form-data"
import {
  normalizeAboutDto,
  normalizeAboutPage,
  unwrapApiData,
} from "@/lib/about-normalize"
import type { AboutDto, AboutPage } from "@/types/about"

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
