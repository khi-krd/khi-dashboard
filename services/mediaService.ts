import api, { toUploadProgress, type UploadProgressHandler } from "@/lib/axios"
import type {
  MediaUploadMultipleResponse,
  MediaUploadResponse,
  MediaUploadResultDto,
} from "@/types/media"

const BASE = "/api/v1/media"

/**
 * `type` is the folder hint sent to the backend — either a media type
 * ("image" | "video" | "audio" | "document") or an entity name
 * ("news", "services", "about", …) which stores the file under
 * "<entity>/<media-type>/" in the bucket.
 */
export async function uploadMedia(
  file: File,
  type?: string,
  onProgress?: UploadProgressHandler,
): Promise<MediaUploadResultDto> {
  const fd = new FormData()
  fd.append("file", file)
  if (type) fd.append("type", type)
  const { data } = await api.post<MediaUploadResponse>(`${BASE}/upload`, fd, {
    onUploadProgress: toUploadProgress(onProgress),
  })
  if (!data.success || !data.data?.fileUrl) {
    throw new Error(data.message || "Media upload failed")
  }
  return data.data
}

export async function uploadMediaMultiple(
  files: File[],
  type?: string,
  onProgress?: UploadProgressHandler,
): Promise<MediaUploadResultDto[]> {
  const fd = new FormData()
  for (const f of files) {
    fd.append("files", f)
  }
  if (type) fd.append("type", type)
  const { data } = await api.post<MediaUploadMultipleResponse>(
    `${BASE}/upload/multiple`,
    fd,
    { onUploadProgress: toUploadProgress(onProgress) },
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
