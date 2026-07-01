import api from "@/lib/axios"
import { normalizeFeaturedCollectionPage } from "@/lib/featured-overlay"
import {
  normalizeCollectionDto,
  normalizeCollectionPage,
  normalizeTopicDto,
  unwrapApiData,
} from "@/lib/image-collections-normalize"
import type {
  CollectionDto,
  CollectionPage,
  NewTopicPayload,
  TopicDto,
} from "@/types/image-collections"
import type { FeaturedPayload } from "@/types/featured"

const BASE = "/api/v1/image-collections"

export async function getCollectionsList(
  page: number,
  size: number,
  params?: { type?: string; topicId?: number },
): Promise<CollectionPage> {
  const { data } = await api.get<unknown>(BASE, {
    params: {
      page,
      size,
      ...(params?.type && params.type !== "all" ? { type: params.type } : {}),
      ...(params?.topicId != null ? { topicId: params.topicId } : {}),
    },
  })
  return normalizeCollectionPage(data)
}

export async function getCollectionById(id: number): Promise<CollectionDto | null> {
  try {
    const { data } = await api.get<unknown>(`${BASE}/${id}`)
    const raw = unwrapApiData<unknown>(data)
    return normalizeCollectionDto(raw)
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404) return null
    throw err
  }
}

export async function createCollectionMultipart(
  formData: FormData,
): Promise<CollectionDto> {
  const { data } = await api.post<unknown>(BASE, formData)
  return normalizeCollectionDto(unwrapApiData(data))
}

export async function createCollectionJson(
  payload: Record<string, unknown>,
): Promise<CollectionDto> {
  const { data } = await api.post<unknown>(`${BASE}/json`, payload)
  return normalizeCollectionDto(unwrapApiData(data))
}

export async function updateCollectionMultipart(
  id: number,
  formData: FormData,
): Promise<CollectionDto> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, formData)
  return normalizeCollectionDto(unwrapApiData(data))
}

export async function updateCollectionJson(
  id: number,
  payload: Record<string, unknown>,
): Promise<CollectionDto> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, payload)
  return normalizeCollectionDto(unwrapApiData(data))
}

export async function deleteCollection(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}

export async function patchCollectionFeatured(
  id: number,
  payload: FeaturedPayload,
): Promise<void> {
  await api.patch(`${BASE}/${id}/featured`, payload)
}

export async function getFeaturedCollections(
  page: number,
  size: number,
): Promise<CollectionPage> {
  const { data } = await api.get<unknown>(`${BASE}/featured`, {
    params: { page, size },
  })
  return normalizeFeaturedCollectionPage(data, page, size)
}

export async function getTopics(): Promise<TopicDto[]> {
  const { data } = await api.get<unknown>(`${BASE}/topics`)
  const unwrapped = unwrapApiData<unknown>(data)
  const list = Array.isArray(unwrapped) ? unwrapped : []
  return list.map(normalizeTopicDto)
}

export async function createTopic(payload: NewTopicPayload): Promise<TopicDto> {
  const { data } = await api.post<unknown>(`${BASE}/topics`, {
    ...payload,
    entityType: "IMAGE",
  })
  return normalizeTopicDto(unwrapApiData(data))
}

export async function deleteTopic(topicId: number): Promise<void> {
  await api.delete(`${BASE}/topics/${topicId}`)
}
