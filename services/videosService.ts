import api from "@/lib/axios"
import { normalizeFeaturedVideoPage } from "@/lib/featured-overlay"
import {
  normalizeTopicDto,
  normalizeVideoDto,
  normalizeVideoPage,
} from "@/lib/videos-normalize"
import type { NewTopicPayload, TopicDto, VideoDto, VideoPage } from "@/types/videos"
import type { VideosListParams } from "@/types/videos-ui"
import type { FeaturedPayload } from "@/types/featured"

const BASE = "/api/v1/videos"

export type { VideosListParams } from "@/types/videos-ui"

export async function getVideosList(
  params: VideosListParams,
): Promise<VideoPage> {
  const { page, size, videoType, memories, topicId } = params
  const { data } = await api.get<unknown>(BASE, {
    params: {
      page,
      size,
      ...(videoType ? { videoType } : {}),
      ...(memories != null ? { memories } : {}),
      ...(topicId != null ? { topicId } : {}),
    },
  })
  return normalizeVideoPage(data)
}

export async function getVideoById(id: number): Promise<VideoDto | null> {
  try {
    const { data } = await api.get<unknown>(`${BASE}/${id}`)
    return normalizeVideoDto(data)
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404) return null
    throw err
  }
}

export async function searchVideosByTag(
  value: string,
  page: number,
  size: number,
): Promise<VideoPage> {
  const { data } = await api.get<unknown>(`${BASE}/search/tag`, {
    params: { value, page, size },
  })
  return normalizeVideoPage(data)
}

export async function searchVideosByKeyword(
  value: string,
  page: number,
  size: number,
): Promise<VideoPage> {
  const { data } = await api.get<unknown>(`${BASE}/search/keyword`, {
    params: { value, page, size },
  })
  return normalizeVideoPage(data)
}

export async function createVideo(formData: FormData): Promise<VideoDto> {
  const { data } = await api.post<unknown>(BASE, formData)
  return normalizeVideoDto(data)
}

export async function updateVideo(
  id: number,
  formData: FormData,
): Promise<VideoDto> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, formData)
  return normalizeVideoDto(data)
}

export async function deleteVideo(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}

export async function patchVideoFeatured(
  id: number,
  payload: FeaturedPayload,
): Promise<void> {
  await api.patch(`${BASE}/${id}/featured`, payload)
}

export async function getFeaturedVideos(
  page: number,
  size: number,
): Promise<VideoPage> {
  const { data } = await api.get<unknown>(`${BASE}/featured`, {
    params: { page, size },
  })
  return normalizeFeaturedVideoPage(data, page, size)
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
