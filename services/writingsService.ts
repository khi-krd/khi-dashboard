import api from "@/lib/axios"
import {
  normalizeSeriesDetail,
  normalizeTopicDto,
  normalizeWritingDto,
  normalizeWritingPage,
} from "@/lib/writings-normalize"
import type {
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
): Promise<WritingPage> {
  const { data } = await api.get<unknown>(`${BASE}/search/writer`, {
    params: { name, page, size },
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

export async function getTopics(): Promise<TopicDto[]> {
  const { data } = await api.get<unknown>(`${BASE}/topics`)
  const list = Array.isArray(data) ? data : []
  return list.map(normalizeTopicDto)
}

export async function createTopic(payload: NewTopicPayload): Promise<TopicDto> {
  const { data } = await api.post<unknown>(`${BASE}/topics`, payload)
  return normalizeTopicDto(data)
}

export async function deleteTopic(topicId: number): Promise<void> {
  await api.delete(`${BASE}/topics/${topicId}`)
}

export async function getSeriesParents(): Promise<WritingDto[]> {
  const { data } = await api.get<unknown>(`${BASE}/series/parents`)
  const list = Array.isArray(data) ? data : []
  return list.map(normalizeWritingDto)
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
