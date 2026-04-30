import {
  toast as sonnerToast,
  Toaster as SonnerPrimitive,
  type ToasterProps,
} from "sonner"

export type { ToasterProps }
export { SonnerPrimitive }

export function toastSuccess(message: string, description?: string): void {
  sonnerToast.success(message, description ? { description } : undefined)
}

export function toastError(message: string, description?: string): void {
  sonnerToast.error(message, description ? { description } : undefined)
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
} as const
