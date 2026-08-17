import type { AxiosError } from "axios"

type ApiErrorBody = {
  message?: string
  messageEn?: string
  messageKu?: string
  details?: Record<string, string>
}

/**
 * The featured endpoints explain every `400` in `details.reason` — the slide
 * cap, a missing hero picture, unsaved donation settings. Read it on its own
 * rather than through `extractApiErrorMessage`, which would prefix it with the
 * key and let a generic `message` win over the sentence that actually says
 * what to do about it.
 */
export function extractApiErrorReason(error: unknown): string | undefined {
  const axiosErr = error as AxiosError<ApiErrorBody>
  const reason = axiosErr.response?.data?.details?.reason
  return reason?.trim() || undefined
}

export function extractApiErrorMessage(error: unknown): string | undefined {
  const axiosErr = error as AxiosError<ApiErrorBody>
  const data = axiosErr.response?.data
  if (!data) return undefined

  if (data.messageEn?.trim()) return data.messageEn.trim()
  if (data.message?.trim()) return data.message.trim()
  if (data.messageKu?.trim()) return data.messageKu.trim()

  if (data.details && typeof data.details === "object") {
    const parts = Object.entries(data.details)
      .map(([key, value]) => `${key}: ${value}`)
      .filter(Boolean)
    if (parts.length > 0) return parts.join(" · ")
  }

  return undefined
}
