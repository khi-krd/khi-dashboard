import api from "@/lib/axios"
import type {
  ApiResponse,
  NewsListResponse,
  NewsSingleResponse,
} from "@/src/types/news"

const BASE = "/api/v1/news"

export async function getNewsList(
  page: number,
  size: number,
): Promise<NewsListResponse> {
  const { data } = await api.get<NewsListResponse>(BASE, {
    params: { page, size },
  })
  return data
}

export async function getNewsById(id: number): Promise<NewsSingleResponse> {
  const { data } = await api.get<NewsSingleResponse>(`${BASE}/${id}`)
  return data
}

export async function searchNews(
  query: string,
  page: number,
  size: number,
): Promise<NewsListResponse> {
  const { data } = await api.get<NewsListResponse>(`${BASE}/search`, {
    params: { query, page, size },
  })
  return data
}

export async function createNews(
  formData: FormData,
): Promise<NewsSingleResponse> {
  const { data } = await api.post<NewsSingleResponse>(
    `${BASE}/with-files`,
    formData,
  )
  return data
}

export async function updateNews(
  id: number,
  formData: FormData,
): Promise<NewsSingleResponse> {
  const { data } = await api.put<NewsSingleResponse>(
    `${BASE}/${id}/with-files`,
    formData,
  )
  return data
}

export async function deleteNews(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`)
  return data
}
