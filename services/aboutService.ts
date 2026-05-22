import api from "@/lib/axios"
import type { AboutWritePayload } from "@/lib/about-form-data"
import {
  normalizeAboutDto,
  normalizeAboutPage,
  unwrapApiData,
} from "@/lib/about-normalize"
import type { AboutDto, AboutPage } from "@/types/about"

const BASE = "/api/v1/about"

/** Candidate detail paths — first match wins. */
const DETAIL_PATHS = (id: number) => [
  `${BASE}/${id}`,
  `/api/v1/about-pages/${id}`,
  `/api/v1/about-page/${id}`,
]

async function fetchAboutDto(path: string): Promise<AboutDto | null> {
  const { data } = await api.get<unknown>(path)
  const raw = unwrapApiData<unknown>(data)
  const dto = normalizeAboutDto(raw)
  return dto.id ? dto : null
}

export async function getAboutList(
  page: number,
  size: number,
): Promise<AboutPage> {
  const { data } = await api.get<unknown>(BASE, { params: { page, size } })
  return normalizeAboutPage(data)
}

export async function getAboutById(id: number): Promise<AboutDto | null> {
  let lastStatus: number | undefined

  for (const path of DETAIL_PATHS(id)) {
    try {
      const dto = await fetchAboutDto(path)
      if (dto) return dto
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status
      lastStatus = status
      if (status === 404 || status === 405) continue
      if (status === 500) continue
      throw err
    }
  }

  if (lastStatus === 404) return null
  return null
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
