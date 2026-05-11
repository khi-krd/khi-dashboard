"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"

import { toastError } from "@/lib/toast"
import { loginSchema, type LoginFormValues } from "@/lib/schemas/login.schema"
import { getMe, login } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"

function getLoginErrorMessage(status: number, data: unknown): string {
  if (status === 401) {
    return "ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە"
  }

  if (status === 403) {
    const msg =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : ""
    const lower = msg.toLowerCase()
    if (lower.includes("lock")) {
      return "ئەژمێرەکەت کلێت کراوەتەوە، پاشان هەوڵبدەرەوە"
    }
    if (lower.includes("disabled") || lower.includes("activated")) {
      return "ئەژمێرەکەت چالاک نییە"
    }
    if (lower.includes("expir")) {
      return "وشەی نهێنیەکەت بەسەرچووە، تکایە ریسێتی بکە"
    }
    return "مۆڵەتت نییە بچووژووەوە"
  }

  return "هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵبدەرەوە"
}

export function useLogin() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      setIsLoading(true)
      setServerError(null)
      try {
        const { token, expiresIn } = await login(values)
        useAuthStore.getState().setAuth(token, expiresIn)

        const sync = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, expiresIn }),
        })
        if (!sync.ok) {
          useAuthStore.getState().clearAuth()
          setServerError("هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵبدەرەوە")
          return
        }

        const user = await getMe()
        useAuthStore.getState().setUser(user)

        router.push("/dashboard")
      } catch (error: unknown) {
        if (isAxiosError(error) && error.response) {
          const status = error.response.status
          setServerError(getLoginErrorMessage(status, error.response.data))
        } else {
          toastError("کێشەی پەیوەندی", "تکایە دووبارە هەوڵبدەرەوە")
        }
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  const clearServerError = useCallback(() => {
    setServerError(null)
  }, [])

  return {
    form,
    onSubmit,
    isLoading,
    serverError,
    clearServerError,
  }
}
