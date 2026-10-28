import { isAxiosError, type AxiosError } from "axios"

import { ERROR_NS } from "@/lib/error-strings"

type ApiErrorBody = {
  code?: string
  /** JWT filter rejects carry the machine key under `error` instead of `code`. */
  error?: string
  message?: string
  messageEn?: string
  messageKu?: string
  details?: Record<string, unknown>
  fieldErrors?: {
    field?: string
    code?: string
    message?: string
    messageEn?: string
    messageKu?: string
  }[]
  requestId?: string
  traceId?: string
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
  return typeof reason === "string" && reason.trim() ? reason.trim() : undefined
}

/**
 * `VALIDATION_ERROR` bodies carry per-field failures in a top-level
 * `fieldErrors` array rather than in `details`.
 */
export function extractApiFieldErrors(error: unknown): string | undefined {
  const axiosErr = error as AxiosError<ApiErrorBody>
  const data = axiosErr.response?.data
  if (!data || typeof data !== "object") return undefined
  const parts = (data.fieldErrors ?? [])
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
    (typeof detailsMessage === "string" && detailsMessage.trim()
      ? detailsMessage.trim()
      : undefined) ??
    extractApiFieldErrors(error) ??
    extractApiErrorMessage(error)
  )
}

export function extractApiErrorMessage(error: unknown): string | undefined {
  const axiosErr = error as AxiosError<ApiErrorBody>
  const data = axiosErr.response?.data
  if (!data || typeof data !== "object") return undefined

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

export type ApiErrorCategory =
  | "validation"
  | "auth"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "too-large"
  | "media-type"
  | "rate-limit"
  | "server"
  | "network"
  | "timeout"
  | "unknown"

export interface ServerFieldError {
  field: string
  message: string
}

export interface ClassifiedApiError {
  /** HTTP status, or null when the request never got a response. */
  status: number | null
  /** Machine key from the body (`code`, or `error` on JWT-filter rejects). */
  code: string | null
  category: ApiErrorCategory
  /** Per-field validation failures the server sent, ready for setError(). */
  fieldErrors: ServerFieldError[]
  /** Correlation id — body `requestId`/`traceId` or the echo header. */
  requestId?: string
  /** Safe to submit the same request again (network, timeout, 5xx, 429). */
  retryable: boolean
  /** Best human-readable line: server's text, else the category's Sorani one. */
  message: string
}

function headerValue(error: AxiosError<ApiErrorBody>, name: string): string | undefined {
  const headers = error.response?.headers
  if (!headers) return undefined
  const raw =
    typeof headers.get === "function"
      ? headers.get(name)
      : (headers as Record<string, unknown>)[name]
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined
}

function classifyByStatus(
  status: number,
  code: string | null,
  hasFieldErrors: boolean,
): ApiErrorCategory {
  if (status === 400) {
    return code === "VALIDATION_ERROR" || hasFieldErrors ? "validation" : "unknown"
  }
  if (status === 401 || status === 423) return "auth"
  if (status === 403) return "forbidden"
  if (status === 404) return "not-found"
  if (status === 408) return "timeout"
  if (status === 409) return "conflict"
  if (status === 413) return "too-large"
  if (status === 415) return "media-type"
  if (status === 422) return "validation"
  if (status === 429) return "rate-limit"
  if (status >= 500) return "server"
  return "unknown"
}

/**
 * Turn any thrown error into a stable diagnosis object. Never throws: the
 * body may be an ApiErrorResponse, the JWT filter's `{error, message}` shape,
 * or a non-JSON proxy page (nginx answers 413 with HTML) — everything is
 * read defensively.
 */
export function classifyApiError(error: unknown): ClassifiedApiError {
  if (!isAxiosError<ApiErrorBody>(error)) {
    return {
      status: null,
      code: null,
      category: "unknown",
      fieldErrors: [],
      retryable: false,
      message: ERROR_NS.unknown.title,
    }
  }

  const data = error.response?.data
  const body = data && typeof data === "object" ? data : null

  const fieldErrors: ServerFieldError[] = (body?.fieldErrors ?? [])
    .filter((fe) => Boolean(fe.field?.trim()))
    .map((fe) => ({
      field: fe.field!.trim(),
      message:
        fe.message?.trim() || fe.messageKu?.trim() || fe.messageEn?.trim() || "",
    }))

  const status = error.response?.status ?? null
  const code = body?.code?.trim() || body?.error?.trim() || null
  const requestId =
    body?.requestId?.trim() ||
    body?.traceId?.trim() ||
    headerValue(error, "x-request-id") ||
    headerValue(error, "x-trace-id")

  let category: ApiErrorCategory
  if (status !== null) {
    category = classifyByStatus(status, code, fieldErrors.length > 0)
  } else if (error.code === "ECONNABORTED") {
    category = "timeout"
  } else {
    category = "network"
  }

  const retryable =
    category === "network" ||
    category === "timeout" ||
    category === "server" ||
    category === "rate-limit"

  return {
    status,
    code,
    category,
    fieldErrors,
    requestId: requestId || undefined,
    retryable,
    message: extractApiErrorText(error) ?? ERROR_NS[category].title,
  }
}
