import { z } from "zod"

export function createLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z
      .string()
      .min(1, { message: t("validation.emailRequired") })
      .email({ message: t("validation.emailInvalid") }),
    password: z.string().min(1, { message: t("validation.passwordRequired") }),
  })
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>
