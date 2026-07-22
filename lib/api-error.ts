import type { AxiosError } from "axios"

type ApiErrorBody = {
  message?: string
  messageEn?: string
  messageKu?: string
  details?: Record<string, string>
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
