import api from "@/lib/axios"
import { normalizeProjectDto } from "@/lib/projects-media-normalize"
import type {
  ProjectListResponse,
  ProjectSingleResponse,
} from "@/types/projects"

const BASE = "/api/v1/projects"

function normalizedList(resp: ProjectListResponse): ProjectListResponse {
  if (!resp.success || !resp.data?.content) return resp
  return {
    ...resp,
    data: {
      ...resp.data,
      content: resp.data.content.map(normalizeProjectDto),
    },
  }
}

function normalizedSingle(resp: ProjectSingleResponse): ProjectSingleResponse {
  if (!resp.success || !resp.data) return resp
  return { ...resp, data: normalizeProjectDto(resp.data) }
}

export async function getProjectsList(
  page: number,
  size: number,
): Promise<ProjectListResponse> {
  const { data } = await api.get<ProjectListResponse>(`${BASE}/getAll`, {
    params: { page, size },
  })
  return normalizedList(data)
}

export async function searchProjectsByTag(
  tag: string,
  page: number,
  size: number,
): Promise<ProjectListResponse> {
  const { data } = await api.get<ProjectListResponse>(`${BASE}/search/tag`, {
    params: { tag, page, size },
  })
  return normalizedList(data)
}

export async function searchProjectsByKeyword(
  keyword: string,
  page: number,
  size: number,
): Promise<ProjectListResponse> {
  const { data } = await api.get<ProjectListResponse>(`${BASE}/search/keyword`, {
    params: { keyword, page, size },
  })
  return normalizedList(data)
}

/** Returns null when endpoint is unavailable — caller uses cache fallback. */
export async function getProjectById(
  id: number,
): Promise<ProjectSingleResponse | null> {
  try {
    const { data } = await api.get<ProjectSingleResponse>(`${BASE}/${id}`)
    return normalizedSingle(data)
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404 || status === 405) return null
    throw err
  }
}

export async function createProject(
  formData: FormData,
): Promise<ProjectSingleResponse> {
  const { data } = await api.post<ProjectSingleResponse>(
    `${BASE}/with-files`,
    formData,
  )
  return normalizedSingle(data)
}

export async function updateProject(
  id: number,
  formData: FormData,
): Promise<ProjectSingleResponse> {
  const { data } = await api.put<ProjectSingleResponse>(
    `${BASE}/update/${id}/with-files`,
    formData,
  )
  return normalizedSingle(data)
}

export async function deleteProject(id: number) {
  const { data } = await api.delete(`${BASE}/delete/${id}`)
  return data
}
