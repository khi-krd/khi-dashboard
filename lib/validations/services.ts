import { z } from "zod"

import { NS } from "@/components/services/services-strings"

const contentRowSchema = z.object({
  languageCode: z.enum(["CKB", "KMR"]),
  title: z.string().max(300).optional().or(z.literal("")),
  description: z.string().optional(),
})

export const serviceFormSchema = z
  .object({
    serviceType: z
      .string()
      .min(1, NS.field.typeRequired)
      .max(100),
    location: z.string().max(200).optional().or(z.literal("")),
    active: z.boolean().default(true),
    publishedAt: z.string().nullable().optional(),
    contentLanguages: z
      .array(z.enum(["CKB", "KMR"]))
      .min(1, NS.validation.languageRequired),
    contents: z.array(contentRowSchema).min(1),
  })
  .superRefine((data, ctx) => {
    for (const lang of data.contentLanguages) {
      const row = data.contents.find((c) => c.languageCode === lang)
      if (!row?.title?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: NS.validation.titleRequired,
          path: [
            "contents",
            data.contents.findIndex((c) => c.languageCode === lang),
            "title",
          ],
        })
      }
    }
  })

export type ServiceFormValues = z.infer<typeof serviceFormSchema>

export function defaultServiceFormValues(): ServiceFormValues {
  return {
    serviceType: "",
    location: "",
    active: true,
    publishedAt: null,
    contentLanguages: ["CKB"],
    contents: [
      { languageCode: "CKB", title: "", description: "" },
      { languageCode: "KMR", title: "", description: "" },
    ],
  }
}

export function serviceDtoToFormValues(
  dto: import("@/types/services").ServiceDto,
): ServiceFormValues {
  const contentLanguages =
    dto.contentLanguages?.length
      ? dto.contentLanguages
      : dto.contents.map((c) => c.languageCode)

  const contents: ServiceFormValues["contents"] = ["CKB", "KMR"].map(
    (lang) => {
      const hit = dto.contents.find((c) => c.languageCode === lang)
      return {
        languageCode: lang as "CKB" | "KMR",
        title: hit?.title ?? "",
        description: hit?.description ?? "",
      }
    },
  )

  return {
    serviceType: dto.serviceType ?? "",
    location: dto.location ?? "",
    active: dto.active ?? true,
    publishedAt: dto.publishedAt ?? null,
    contentLanguages,
    contents,
  }
}
