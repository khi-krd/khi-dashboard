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

/** Direct backend URL for multipart uploads (bypasses Vercel's ~4.5MB proxy limit). */
const directUploadBaseUrl = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_DIRECT_API_URL,
)

/**
 * Use DIRECT_API_URL only when it helps (Vercel body limit) and CORS can succeed.
 * On localhost, keep same-origin `/railway-proxy` — direct Railway calls fail CORS
 * (OPTIONS 403, no Access-Control-Allow-Origin) and local Next has no 4.5MB cap.
 */
function shouldBypassProxyForUpload(): boolean {
  if (!directUploadBaseUrl) return false
  if (typeof window === "undefined") return true
  const host = window.location.hostname
  if (host === "localhost" || host === "127.0.0.1") return false
  return true
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
      // Vercel serverless rejects bodies > ~4.5MB (FUNCTION_PAYLOAD_TOO_LARGE).
      // Send uploads straight to the API; auth is via Bearer, not cross-origin cookies.
      if (shouldBypassProxyForUpload()) {
        config.baseURL = directUploadBaseUrl
        config.withCredentials = false
      }
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
          // `keepalive` lets the cookie-clearing DELETE survive the navigation
          // below; without it the browser can cancel it mid-flight and
          // `auth_token` lingers, so the middleware bounces the user back to
          // /dashboard on the next load and a redirect loop forms.
          void fetch("/api/auth/session", {
            method: "DELETE",
            keepalive: true,
          }).catch(() => {
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