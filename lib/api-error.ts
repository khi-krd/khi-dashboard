import type { AxiosError } from "axios"

type ApiErrorBody = {
  code?: string
  message?: string
  messageEn?: string
  messageKu?: string
  details?: Record<string, string>
  fieldErrors?: { field?: string; message?: string }[]
}

/**
 * The stable machine-readable key — `sound.reklamVideo.not_found`,
 * `error.validation`, and so on. Branch on this, never on the message text:
 * the text is translated per request and changes with `Accept-Language`.
 */
export function extractApiErrorCode(error: unknown): string | undefined {
  const axiosErr = error as AxiosError<ApiErrorBody>
  return axiosErr.response?.data?.code?.trim() || undefined
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

/**
 * `VALIDATION_ERROR` bodies carry per-field failures in a top-level
 * `fieldErrors` array rather than in `details`.
 */
export function extractApiFieldErrors(error: unknown): string | undefined {
  const axiosErr = error as AxiosError<ApiErrorBody>
  const parts = (axiosErr.response?.data?.fieldErrors ?? [])
    .map((fe) =>
      [fe.field?.trim(), fe.message?.trim()].filter(Boolean).join(": "),
    )
    .filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : undefined
}

/**
 * The most actionable human-readable text on the body, for toasts: the
 * `details.reason` sentence where one exists, then `details.message`
 * (image-collection errors carry it there), then per-field errors, then the
 * generic message chain.
 */
export function extractApiErrorText(error: unknown): string | undefined {
  const axiosErr = error as AxiosError<ApiErrorBody>
  const detailsMessage = axiosErr.response?.data?.details?.message
  return (
    extractApiErrorReason(error) ??
    (detailsMessage?.trim() || undefined) ??
    extractApiFieldErrors(error) ??
    extractApiErrorMessage(error)
  )
}

export function extractApiErrorMessage(error: unknown): string | undefined {
  const axiosErr = error as AxiosError<ApiErrorBody>
  const data = axiosErr.response?.data
  if (!data) return undefined

  // `message` first, deliberately. It is the only field the backend actually
  // localises — resolved from the request's `Accept-Language`, which the axios
  // client pins to `ckb`. `messageEn` and `messageKu` fall back to generic
  // per-code strings ("Resource not found") on *every* endpoint, not just one:
  // the English bundle is off the classpath — its filename,
  // `i18n/ messages_en.properties`, has a stray leading space — and `messageKu`
  // resolves against locale `ku`, for which no bundle exists, the Sorani file
  // being `messages_ckb`. Reading `messageEn` first meant every toast in the
  // dashboard showed that generic string in place of the sentence saying what
  // actually went wrong. They stay as last resorts in case `message` is blank.
  if (data.message?.trim()) return data.message.trim()
  if (data.messageEn?.trim()) return data.messageEn.trim()
  if (data.messageKu?.trim()) return data.messageKu.trim()

  if (data.details && typeof data.details === "object") {
    const parts = Object.entries(data.details)
      .map(([key, value]) => `${key}: ${value}`)
      .filter(Boolean)
    if (parts.length > 0) return parts.join(" · ")
  }

  return undefined
}
