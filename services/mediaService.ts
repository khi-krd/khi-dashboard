import api from "@/lib/axios"
import type {
  MediaUploadMultipleResponse,
  MediaUploadResponse,
  MediaUploadResultDto,
  MediaUploadType,
} from "@/types/media"

const BASE = "/api/v1/media"

export async function uploadMedia(
  file: File,
  type?: MediaUploadType,
): Promise<MediaUploadResultDto> {
  const fd = new FormData()
  fd.append("file", file)
  if (type) fd.append("type", type)
  const { data } = await api.post<MediaUploadResponse>(`${BASE}/upload`, fd)
  if (!data.success || !data.data?.fileUrl) {
    throw new Error(data.message || "Media upload failed")
  }
  return data.data
}

export async function uploadMediaMultiple(
  files: File[],
  type?: MediaUploadType,
): Promise<MediaUploadResultDto[]> {
  const fd = new FormData()
  for (const f of files) {
    fd.append("files", f)
  }
  if (type) fd.append("type", type)
  const { data } = await api.post<MediaUploadMultipleResponse>(
    `${BASE}/upload/multiple`,
    fd,
  )
  if (!data.success || !data.data?.length) {
    throw new Error(data.message || "Media upload failed")
  }
  return data.data
}

export async function deleteMedia(fileUrl: string): Promise<void> {
  await api.delete(`${BASE}`, {
    params: { fileUrl },
  })
}
