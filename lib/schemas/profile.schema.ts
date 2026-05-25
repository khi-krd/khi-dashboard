import { z } from "zod"

export const profileSchema = z.object({
  name: z
    .string()
    .max(120, "ناو نابێت لە ١٢٠ پیت زیاتر بێت")
    .optional()
    .or(z.literal("")),
  username: z.union([
    z.literal(""),
    z
      .string()
      .regex(
        /^[A-Za-z0-9_]{3,80}$/,
        "ناوی بەکارهێنەر دەبێت ٣ بۆ ٨٠ پیت بێت — تەنها پیت، ژمارە و _",
      ),
  ]),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

export const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "وشەی نهێنی لانیکەم ٦ پیت دەبێت")
      .max(128),
    newPassword: z
      .string()
      .min(6, "وشەی نهێنی نوێ لانیکەم ٦ پیت دەبێت")
      .max(128),
    confirmPassword: z
      .string()
      .min(6, "دڵنیاکردنەوەی وشەی نهێنی پێویستە")
      .max(128),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "وشە نهێنییە نوێیەکان وەک یەک نین",
  })

export type PasswordFormValues = z.infer<typeof passwordSchema>
