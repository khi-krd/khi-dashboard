import api from "@/lib/axios"
import { normalizeServiceDto } from "@/lib/services-media-normalize"
import {
  uploadMedia,
  uploadMediaMultiple,
} from "@/services/mediaService"
import type { MediaUploadResultDto } from "@/types/media"
import type {
  ApiResponse,
  ServiceListResponse,
  ServiceSingleResponse,
  ServiceTypesResponse,
  ServiceUploadResponse,
} from "@/types/services"

const BASE = "/api/v1/services"

function normalizedList(resp: ServiceListResponse): ServiceListResponse {
  if (!resp.success || !resp.data?.content) return resp
  return {
    ...resp,
    data: {
      ...resp.data,
      content: resp.data.content.map(normalizeServiceDto),
    },
  }
}

function normalizedSingle(
  resp: ServiceSingleResponse,
): ServiceSingleResponse {
  if (!resp.success || !resp.data) return resp
  return { ...resp, data: normalizeServiceDto(resp.data) }
}

export async function getServicesList(
  page: number,
  size: number,
): Promise<ServiceListResponse> {
  const { data } = await api.get<ServiceListResponse>(`${BASE}/all`, {
    params: { page, size },
  })
  return normalizedList(data)
}

export async function searchServicesAdmin(
  q: string,
  page: number,
  size: number,
): Promise<ServiceListResponse> {
  const { data } = await api.get<ServiceListResponse>(`${BASE}/search/admin`, {
    params: { q, page, size },
  })
  return normalizedList(data)
}

export async function getServiceById(
  id: number,
): Promise<ServiceSingleResponse | null> {
  try {
    const { data } = await api.get<ServiceSingleResponse>(`${BASE}/${id}`)
    return normalizedSingle(data)
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response
      ?.status
    if (status === 404 || status === 405) return null
    throw err
  }
}

export async function getServiceTypes(): Promise<string[]> {
  try {
    const { data } = await api.get<ServiceTypesResponse>(`${BASE}/types`)
    if (data.success && Array.isArray(data.data)) return data.data
    return []
  } catch {
    return []
  }
}

export async function createService(
  payload: unknown,
): Promise<ServiceSingleResponse> {
  return createServiceJson(payload)
}

export async function updateService(
  id: number,
  payload: unknown,
): Promise<ServiceSingleResponse> {
  return updateServiceJson(id, payload)
}

export async function createServiceJson(
  payload: unknown,
): Promise<ServiceSingleResponse> {
  const { data } = await api.post<ServiceSingleResponse>(`${BASE}/`, payload)
  return normalizedSingle(data)
}

export async function updateServiceJson(
  id: number,
  payload: unknown,
): Promise<ServiceSingleResponse> {
  const { data } = await api.put<ServiceSingleResponse>(
    `${BASE}/${id}`,
    payload,
  )
  return normalizedSingle(data)
}

export async function toggleServiceActive(
  id: number,
  value: boolean,
): Promise<ServiceSingleResponse> {
  const { data } = await api.patch<ServiceSingleResponse>(
    `${BASE}/${id}/active`,
    null,
    { params: { value } },
  )
  return normalizedSingle(data)
}

export async function deleteService(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`)
  return data
}

export async function bulkDeleteServices(ids: number[]): Promise<void> {
  try {
    await api.delete(`${BASE}/bulk`, { data: { ids } })
  } catch {
    await Promise.all(ids.map((id) => deleteService(id)))
  }
}

function toServiceUploadResponse(
  results: MediaUploadResultDto[],
): ServiceUploadResponse {
  return {
    success: true,
    message: "",
    data: results.map((r) => ({
      fileUrl: r.fileUrl,
      fileName: r.fileName,
      fileSize: r.fileSize,
      contentType: r.contentType,
    })),
  }
}

export async function uploadServiceFiles(
  files: File[],
): Promise<ServiceUploadResponse> {
  const results = await uploadMediaMultiple(files)
  return toServiceUploadResponse(results)
}

export async function uploadServiceFile(
  file: File,
): Promise<ServiceUploadResponse> {
  const result = await uploadMedia(file)
  return toServiceUploadResponse([result])
}
