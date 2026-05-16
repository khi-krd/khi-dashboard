import api from "@/lib/axios"
import { normalizeNewsDto } from "@/lib/news-media-normalize"
import type {
  ApiResponse,
  NewsListResponse,
  NewsSingleResponse,
} from "@/types/news"

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
    params: { keyword, page, size },
  })
  return normalizedList(data)
}

export async function bulkDeleteNews(ids: number[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteNews(id)))
}

export async function createNews(
  formData: FormData,
): Promise<NewsSingleResponse> {
  const { data } = await api.post<NewsSingleResponse>(
    `${BASE}/with-files`,
    formData,
  )
  return normalizedSingle(data)
}

export async function updateNews(
  id: number,
  formData: FormData,
): Promise<NewsSingleResponse> {
  const { data } = await api.put<NewsSingleResponse>(
    `${BASE}/${id}/with-files`,
    formData,
  )
  return normalizedSingle(data)
}

export async function deleteNews(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`)
  return data
}
