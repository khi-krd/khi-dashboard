import {
  toast as sonnerToast,
  Toaster as SonnerPrimitive,
  type ToasterProps,
} from "sonner"

import { classifyApiError, extractApiErrorText } from "@/lib/api-error"
import { ERROR_NS } from "@/lib/error-strings"

export type { ToasterProps }
export { SonnerPrimitive }

export function toastSuccess(message: string, description?: string): void {
  sonnerToast.success(message, description ? { description } : undefined)
}

export function toastError(message: string, description?: string): void {
  sonnerToast.error(message, description ? { description } : undefined)
}

/**
 * The standard way to surface a failed API call: the server's own sentence
 * when it sent one (localized via Accept-Language), otherwise the caller's
 * generic fallback, otherwise the classified category label. The description
 * line always adds the category hint and — when the backend echoed one — the
 * correlation id so a report can be traced: `… · #a1b2c3d4`.
 */
export function toastApiError(error: unknown, fallback?: string): void {
  const classified = classifyApiError(error)
  const serverText = extractApiErrorText(error)
  const label = ERROR_NS[classified.category].title
  const description = [
    // Category tag only earns a line when a real sentence leads the toast.
    serverText || fallback ? label : null,
    ERROR_NS[classified.category].hint,
    classified.requestId ? `#${classified.requestId.slice(0, 8)}` : null,
  ]
    .filter(Boolean)
    .join(" · ")
  toastError(serverText ?? fallback ?? label, description || undefined)
}

export function toastInfo(message: string, description?: string): void {
  sonnerToast.info(message, description ? { description } : undefined)
}

export function toastWarning(message: string, description?: string): void {
  sonnerToast.warning(message, description ? { description } : undefined)
}

export function toastLoading(message: string): string | number {
  return sonnerToast.loading(message)
}

export function toastDismiss(id?: string | number): void {
  sonnerToast.dismiss(id)
}

export function toastPromise<T>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string },
): Promise<T> {
  return sonnerToast.promise(promise, messages).unwrap()
}

export const systemToast = {
  networkError: () => toastError("کێشەی پەیوەندی", "تکایە دووبارە هەوڵبدەرەوە"),
  serverError: () => toastError("هەڵەی سێرڤەر", "تکایە چەند خولەکێک چاوەڕێ بکە"),
  unauthorized: () => toastError("مۆڵەتت نییە", "تکایە دووبارە بچووژووەوە"),
  saveSuccess: () => toastSuccess("بەسەرچوو", "گۆڕانکارییەکان پاشەکەوت کران"),
  saveError: () => toastError("پاشەکەوت نەکرا", "تکایە دووبارە هەوڵبدەرەوە"),
  deleteSuccess: () => toastSuccess("سڕایەوە", "بە سەرکەوتوویی سڕایەوە"),
  deleteError: () => toastError("نەسڕایەوە", "تکایە دووبارە هەوڵبدەرەوە"),
  updateSuccess: () => toastSuccess("نوێکرایەوە", "گۆڕانکارییەکان جێبەجێ کران"),
  updateError: () => toastError("نوێ نەکرایەوە", "تکایە دووبارە هەوڵبدەرەوە"),
  createSuccess: () => toastSuccess("دروستکرا", "بە سەرکەوتوویی زیادکرا"),
  createError: () => toastError("دروست نەکرا", "تکایە دووبارە هەوڵبدەرەوە"),
  uploadSuccess: () => toastSuccess("بارکرا", "فایلەکە بە سەرکەوتوویی بارکرا"),
  uploadError: () => toastError("بارنەکرا", "تکایە دووبارە هەوڵبدەرەوە"),
  logoutSuccess: () => toastSuccess("چووتە دەرەوە", "بە سەرکەوتوویی دەرچوویت"),
  sessionExpired: () => toastWarning("کاتی دانیشتن تەواو بوو", "تکایە دووبارە بچووژووەوە"),
  sessionExpiringSoon: (onReLogin?: () => void) =>
    sonnerToast.warning("کاتی دانیشتن بەم زووانە تەواو دەبێت", {
      description: "بەم نزیکانە دەردەچیت، تکایە کارەکانت پاشەکەوت بکە",
      duration: 60_000,
      action: onReLogin
        ? { label: "چوونەوە ژوورەوە", onClick: onReLogin }
        : undefined,
    }),
} as const
