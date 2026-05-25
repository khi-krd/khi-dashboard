import type { ServiceDto } from "@/types/services"

import type { ServiceFormValues } from "@/lib/validations/services"

export function serviceFormValuesToPayload(
  mode: "create" | "edit",
  serviceId: number | undefined,
  values: ServiceFormValues,
): Omit<ServiceDto, "createdAt" | "updatedAt" | "createdBy" | "updatedBy"> & {
  id?: number
} {
  const contents = values.contentLanguages.map((lang) => {
    const row = values.contents.find((c) => c.languageCode === lang)!
    return {
      languageCode: lang,
      title: row.title?.trim() ?? "",
      description: row.description ?? "",
    }
  })

  return {
    ...(mode === "edit" && typeof serviceId === "number"
      ? { id: serviceId }
      : {}),
    serviceType: values.serviceType.trim(),
    location: values.location?.trim() || undefined,
    active: values.active,
    publishedAt: values.publishedAt ?? null,
    contents,
    contentLanguages: values.contentLanguages,
  }
}
