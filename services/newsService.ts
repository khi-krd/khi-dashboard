import api from "@/lib/axios"
import type { NewsWritePayload } from "@/lib/news-form-data"
import { normalizeFeaturedNewsPage } from "@/lib/featured-overlay"
import { normalizeNewsDto } from "@/lib/news-media-normalize"
import type {
  ApiResponse,
  NewsListResponse,
  NewsSingleResponse,
} from "@/types/news"
import type { FeaturedPayload } from "@/types/featured"

const BASE = "/api/v1/news"

function normalizedList(resp: NewsListResponse): NewsListResponse {
  if (!resp.success || !resp.data?.content) return resp
  return {
    ...resp,
    data: {
      ...resp.data,
      content: resp.data.content.map(normalizeNewsDto),
    },
  }
}

function normalizedSingle(resp: NewsSingleResponse): NewsSingleResponse {
  if (!resp.success || !resp.data) return resp
  return { ...resp, data: normalizeNewsDto(resp.data) }
}

export async function getNewsList(
  page: number,
  size: number,
): Promise<NewsListResponse> {
  const { data } = await api.get<NewsListResponse>(BASE, {
    params: { page, size },
  })
  return normalizedList(data)
}

export async function getNewsById(id: number): Promise<NewsSingleResponse> {
  const { data } = await api.get<NewsSingleResponse>(`${BASE}/${id}`)
  return normalizedSingle(data)
}

export async function searchNews(
  keyword: string,
  page: number,
  size: number,
): Promise<NewsListResponse> {
  const { data } = await api.get<NewsListResponse>(`${BASE}/search`, {
    params: { q: keyword, keyword, page, size },
  })
  return normalizedList(data)
}

export async function bulkDeleteNews(ids: number[]): Promise<void> {
  await api.delete(`${BASE}/bulk`, { data: { ids } })
}

export async function createNews(
  payload: NewsWritePayload,
): Promise<NewsSingleResponse> {
  const { data } = await api.post<NewsSingleResponse>(BASE, payload)
  return normalizedSingle(data)
}

export async function updateNews(
  id: number,
  payload: NewsWritePayload,
): Promise<NewsSingleResponse> {
  const { data } = await api.put<NewsSingleResponse>(`${BASE}/${id}`, payload)
  return normalizedSingle(data)
}

export async function deleteNews(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`)
  return data
}

export async function patchNewsFeatured(
  id: number,
  payload: FeaturedPayload,
): Promise<void> {
  await api.patch(`${BASE}/${id}/featured`, payload)
}

export async function getFeaturedNews(
  page: number,
  size: number,
): Promise<NonNullable<NewsListResponse["data"]>> {
  const { data } = await api.get<unknown>(`${BASE}/featured`, {
    params: { page, size },
  })
  return normalizeFeaturedNewsPage(data, page, size)
}
