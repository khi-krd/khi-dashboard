import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { useAuthStore } from "@/store/auth.store"

/**
 * - Full URL: used as-is (trim trailing slash).
 * - Path starting with `/`: same-origin base (e.g. `/railway-proxy` for Next rewrites).
 * - Host without scheme: browser would treat it as a path on the current origin — prepend https/http.
 */
function normalizeApiBaseUrl(raw: string | undefined): string {
  const trimmed = (raw ?? "").trim().replace(/\/+$/, "")
  if (!trimmed) return ""
  if (trimmed.startsWith("/")) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^(localhost|127\.0\.0\.1)/i.test(trimmed)) return `http://${trimmed}`
  return `https://${trimmed}`
}

const api = axios.create({
  baseURL: normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Defaults set application/json — that breaks multipart: server never sees boundary.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers.delete("Content-Type")
    }
    return config
  },
  (error: unknown) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const reqPath = error.config?.url ?? ""
      const isLoginAttempt = reqPath.includes("/api/auth/login")
      if (!isLoginAttempt) {
        useAuthStore.getState().clearAuth()
        if (typeof window !== "undefined") {
          void import("sonner").then(({ toast }) => {
            toast.error("ناچار بوویتە دیسان بچیتە ژوورەوە", {
              duration: 2800,
            })
          })
          void fetch("/api/auth/session", { method: "DELETE" }).catch(() => {
            /* ignore */
          })
          window.location.href = "/login"
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api
