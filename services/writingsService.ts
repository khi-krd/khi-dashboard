import api from "@/lib/axios"
import {
  normalizeSeriesDetail,
  normalizeTopicDto,
  normalizeTopicList,
  normalizeWritingDto,
  normalizeWritingPage,
} from "@/lib/writings-normalize"
import { normalizeFeaturedWritingPage } from "@/lib/featured-overlay"
import type {
  FeaturedPayload,
  LinkSeriesPayload,
  NewTopicPayload,
  SeriesDetailDto,
  TopicDto,
  WritingDto,
  WritingPage,
} from "@/types/writings"

const BASE = "/api/v1/writings"

export async function getWritingsList(
  page: number,
  size: number,
): Promise<WritingPage> {
  const { data } = await api.get<unknown>(BASE, { params: { page, size } })
  return normalizeWritingPage(data)
}

export async function getWritingById(id: number): Promise<WritingDto | null> {
  try {
    const { data } = await api.get<unknown>(`${BASE}/${id}`)
    return normalizeWritingDto(data)
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404) return null
    throw err
  }
}

export async function searchWritingsByWriter(
  name: string,
  page: number,
  size: number,
  language?: string,
): Promise<WritingPage> {
  const { data } = await api.get<unknown>(`${BASE}/search/writer`, {
    params: { name, page, size, ...(language ? { language } : {}) },
  })
  return normalizeWritingPage(data)
}

export async function searchWritingsByTag(
  tag: string,
  page: number,
  size: number,
): Promise<WritingPage> {
  const { data } = await api.get<unknown>(`${BASE}/search/tag`, {
    params: { tag, page, size },
  })
  return normalizeWritingPage(data)
}

export async function searchWritingsByKeyword(
  keyword: string,
  page: number,
  size: number,
): Promise<WritingPage> {
  const { data } = await api.get<unknown>(`${BASE}/search/keyword`, {
    params: { keyword, page, size },
  })
  return normalizeWritingPage(data)
}

export async function createWriting(formData: FormData): Promise<WritingDto> {
  const { data } = await api.post<unknown>(BASE, formData)
  return normalizeWritingDto(data)
}

export async function updateWriting(
  id: number,
  formData: FormData,
): Promise<WritingDto> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, formData)
  return normalizeWritingDto(data)
}

export async function deleteWriting(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}

export async function patchWritingFeatured(
  id: number,
  payload: FeaturedPayload,
): Promise<void> {
  await api.patch(`${BASE}/${id}/featured`, payload)
}

export async function getFeaturedWritings(
  page: number,
  size: number,
): Promise<WritingPage> {
  const { data } = await api.get<unknown>(`${BASE}/featured`, {
    params: { page, size },
  })
  return normalizeFeaturedWritingPage(data, page, size)
}

export async function getTopics(): Promise<TopicDto[]> {
  const { data } = await api.get<unknown>(`${BASE}/topics`)
  return normalizeTopicList(data)
}

export async function createTopic(payload: NewTopicPayload): Promise<TopicDto> {
  const { data } = await api.post<unknown>(`${BASE}/topics`, payload)
  return normalizeTopicDto(data)
}

export async function deleteTopic(topicId: number): Promise<void> {
  await api.delete(`${BASE}/topics/${topicId}`)
}

export async function getSeriesParents(
  page = 0,
  size = 100,
): Promise<WritingDto[]> {
  const { data } = await api.get<unknown>(`${BASE}/series/parents`, {
    params: { page, size },
  })
  return normalizeWritingPage(data).content
}

export async function getSeriesById(
  seriesId: string,
): Promise<SeriesDetailDto | null> {
  try {
    const { data } = await api.get<unknown>(`${BASE}/series/${seriesId}`)
    return normalizeSeriesDetail(data)
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404) return null
    throw err
  }
}

export async function linkToSeries(
  payload: LinkSeriesPayload,
): Promise<WritingDto> {
  const { data } = await api.post<unknown>(`${BASE}/series/link`, payload)
  return normalizeWritingDto(data)
}
