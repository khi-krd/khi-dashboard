import api from "@/lib/axios"
import {
  normalizeSoundDto,
  normalizeSoundPage,
  normalizeTopicDto,
} from "@/lib/sounds-normalize"
import type {
  NewTopicPayload,
  SoundDto,
  SoundPage,
  TopicDto,
  TrackState,
} from "@/types/sounds"

const BASE = "/api/v1/soundtracks"

export async function getSoundsList(
  page: number,
  size: number,
): Promise<SoundPage> {
  const { data } = await api.get<unknown>(BASE, { params: { page, size } })
  return normalizeSoundPage(data)
}

export async function getSoundById(id: number): Promise<SoundDto | null> {
  try {
    const { data } = await api.get<unknown>(`${BASE}/${id}`)
    return normalizeSoundDto(data)
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404) return null
    throw err
  }
}

export async function searchSounds(
  q: string,
  page: number,
  size: number,
): Promise<SoundPage> {
  const { data } = await api.get<unknown>(`${BASE}/search`, {
    params: { q, page, size },
  })
  return normalizeSoundPage(data)
}

export async function getSoundsByState(
  state: TrackState,
  page: number,
  size: number,
): Promise<SoundPage> {
  const { data } = await api.get<unknown>(`${BASE}/by-state`, {
    params: { state, page, size },
  })
  return normalizeSoundPage(data)
}

export async function getAlbumOfMemories(
  page: number,
  size: number,
): Promise<SoundPage> {
  const { data } = await api.get<unknown>(`${BASE}/album-of-memories`, {
    params: { page, size },
  })
  return normalizeSoundPage(data)
}

export async function getSoundsByType(
  type: string,
  page: number,
  size: number,
): Promise<SoundPage> {
  const { data } = await api.get<unknown>(`${BASE}/by-sound-type`, {
    params: { type, page, size },
  })
  return normalizeSoundPage(data)
}

export async function getSoundsByTopic(
  topicId: number,
  page: number,
  size: number,
): Promise<SoundPage> {
  const { data } = await api.get<unknown>(`${BASE}/by-topic`, {
    params: { topicId, page, size },
  })
  return normalizeSoundPage(data)
}

export async function searchSoundsByTag(
  value: string,
  page: number,
  size: number,
): Promise<SoundPage> {
  const { data } = await api.get<unknown>(`${BASE}/search/tag`, {
    params: { value, page, size },
  })
  return normalizeSoundPage(data)
}

export async function searchSoundsByKeyword(
  value: string,
  page: number,
  size: number,
): Promise<SoundPage> {
  const { data } = await api.get<unknown>(`${BASE}/search/keyword`, {
    params: { value, page, size },
  })
  return normalizeSoundPage(data)
}

export async function createSound(formData: FormData): Promise<SoundDto> {
  const { data } = await api.post<unknown>(BASE, formData)
  return normalizeSoundDto(data)
}

export async function updateSound(
  id: number,
  formData: FormData,
): Promise<SoundDto> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, formData)
  return normalizeSoundDto(data)
}

export async function deleteSound(id: number): Promise<void> {
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
