import { isAxiosError } from "axios"
import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

import { toastError } from "@/lib/toast"
import type { ApiFieldError } from "@/types/auth"

const DEFAULT_FALLBACK = "هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵبدەرەوە"

type ApplyApiErrorsOptions<T extends FieldValues> = {
  /** Map backend field names → form field paths when they differ. */
  fieldMap?: Partial<Record<string, Path<T>>>
  /** Form field to attach a message-only (non-field) 400 business error to. */
  messageField?: Path<T>
  /** Form field to attach a 409 conflict to. Defaults to "username". */
  conflictField?: Path<T>
  fallback?: string
}

function readMessage(data: unknown): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  ) {
    return (data as { message: string }).message
  }
  return ""
}

/**
 * Translate a backend auth/profile error into react-hook-form field errors
 * where possible, falling back to a toast. Handles the documented shapes:
 * `400` validation (`errors[]`), `409` conflict, and message-only `400`.
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  options: ApplyApiErrorsOptions<T> = {},
): void {
  const fallback = options.fallback ?? DEFAULT_FALLBACK

  if (isAxiosError(error) && error.response) {
    const { status, data } = error.response

    if (
      status === 400 &&
      typeof data === "object" &&
      data !== null &&
      Array.isArray((data as { errors?: unknown }).errors)
    ) {
      const errors = (data as { errors: ApiFieldError[] }).errors
      let applied = false
      for (const fieldError of errors) {
        const target =
          options.fieldMap?.[fieldError.field] ?? (fieldError.field as Path<T>)
        setError(target, { type: "server", message: fieldError.message })
        applied = true
      }
      if (applied) return
    }

    if (status === 409) {
      const target = options.conflictField ?? ("username" as Path<T>)
      setError(target, {
        type: "server",
        message: "ئەم ناوی بەکارهێنەرە پێشتر بەکارهاتووە",
      })
      return
    }

    if (status === 400) {
      const message = readMessage(data)
      if (message && options.messageField) {
        setError(options.messageField, { type: "server", message })
        return
      }
      if (message) {
        toastError(fallback, message)
        return
      }
    }
  }

  toastError(fallback)
}
