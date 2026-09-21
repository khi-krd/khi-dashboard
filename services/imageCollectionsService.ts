import api, { toUploadProgress, type UploadProgressHandler } from "@/lib/axios"
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
const TOPICS_BASE = "/api/v1/topics"

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
  onProgress?: UploadProgressHandler,
): Promise<CollectionDto> {
  const { data } = await api.post<unknown>(BASE, formData, {
    onUploadProgress: toUploadProgress(onProgress),
  })
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
  onProgress?: UploadProgressHandler,
): Promise<CollectionDto> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, formData, {
    onUploadProgress: toUploadProgress(onProgress),
  })
  return normalizeCollectionDto(unwrapApiData(data))
}

/**
 * Bulk list order — `orderedIds[i]` becomes sortOrder = i on the backend.
 * Unlisted collections keep their existing order and render after the listed ones.
 */
export async function reorderCollections(orderedIds: number[]): Promise<void> {
  await api.put(`${BASE}/order`, { orderedIds })
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
  const { data } = await api.post<unknown>(`${TOPICS_BASE}/IMAGE`, {
    nameCkb: payload.nameCkb ?? null,
    nameKmr: payload.nameKmr ?? null,
  })
  return normalizeTopicDto(unwrapApiData(data))
}

export async function deleteTopic(topicId: number): Promise<void> {
  await api.delete(`${TOPICS_BASE}/${topicId}`)
}
