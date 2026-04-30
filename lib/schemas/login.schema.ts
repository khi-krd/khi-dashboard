import { z } from "zod"

export const loginSchema = z.object({
  username: z.string().min(1, "ناوی بەکارهێنەر پێویستە").max(160),
  password: z
    .string()
    .min(6, "وشەی نهێنی لانیکەم ٦ پیت دەبێت")
    .max(128),
})

export type LoginFormValues = z.infer<typeof loginSchema>
