export type MediaUploadType = "image" | "video" | "audio" | "document"

export type MediaUploadResultDto = {
  fileUrl: string
  fileName?: string
  fileSize?: number
  contentType?: string
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data?: T
}

export type MediaUploadResponse = ApiResponse<MediaUploadResultDto>
export type MediaUploadMultipleResponse = ApiResponse<MediaUploadResultDto[]>
