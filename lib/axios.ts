import axios, {
  AxiosError,
  type AxiosProgressEvent,
  type InternalAxiosRequestConfig,
} from "axios"
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

/**
 * Origin of the real backend, used ONLY for multipart bodies. Vercel drops
 * any request over 4.5MB (`FUNCTION_PAYLOAD_TOO_LARGE`) before the
 * `/railway-proxy` function can run — that cap is infrastructural and cannot
 * be raised — so FormData uploads skip the proxy and go straight to the API,
 * which accepts up to 1GB. Empty string means "proxy everything" (local dev,
 * Docker, or anywhere without Vercel's limit in front).
 */
const directApiBase = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_DIRECT_URL,
)

const api = axios.create({
  baseURL: normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL),
  headers: {
    "Content-Type": "application/json",
    // `message` is the only error field the backend localises, and it is
    // resolved from this header (`ckb`, `kmr`, `en`). Left unset the server
    // picks its own default, which is how a Sorani-only dashboard ended up
    // able to surface an English sentence in a toast.
    "Accept-Language": "ckb",
  },
  withCredentials: true,
})

/**
 * Bearer token for direct-to-backend uploads. The httpOnly `auth_token`
 * cookie is same-origin only, so a cross-origin request must carry the JWT
 * itself. The store holds it in memory after login; after a page refresh it
 * is recovered once from `GET /api/auth/session` and memoized here for the
 * lifetime of the page.
 */
let recoveredToken: string | null = null
let recoveredTokenPromise: Promise<string | null> | null = null

function getDirectToken(): Promise<string | null> | string | null {
  const fromStore = useAuthStore.getState().token
  if (fromStore) return fromStore
  if (recoveredToken) return recoveredToken
  if (!recoveredTokenPromise) {
    recoveredTokenPromise = fetch("/api/auth/session", {
      credentials: "same-origin",
    })
      .then(async (res) => {
        if (!res.ok) return null
        const body = (await res.json()) as { token?: unknown }
        return typeof body.token === "string" && body.token ? body.token : null
      })
      .catch(() => null)
      .then((token) => {
        recoveredToken = token
        recoveredTokenPromise = null
        return token
      })
  }
  return recoveredTokenPromise
}

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const isMultipart =
      typeof FormData !== "undefined" && config.data instanceof FormData

    if (isMultipart && directApiBase && typeof window !== "undefined") {
      config.baseURL = directApiBase
      const directToken = await getDirectToken()
      if (directToken) {
        config.headers.Authorization = `Bearer ${directToken}`
      }
    } else {
      const token = useAuthStore.getState().token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    // Defaults set application/json — that breaks multipart: server never sees boundary.
    if (isMultipart) {
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

/** Called with the uploaded percentage (0–100) while a request body streams. */
export type UploadProgressHandler = (percent: number) => void

/**
 * Adapts axios' `AxiosProgressEvent` to a plain percent callback.
 * `progress` is absent when the total size is unknown (chunked upload), in
 * which case the caller gets a clamped estimate instead of silence.
 */
export function toUploadProgress(
  handler?: UploadProgressHandler,
): ((event: AxiosProgressEvent) => void) | undefined {
  if (!handler) return undefined
  return (event) => {
    const ratio =
      event.progress ?? (event.total ? event.loaded / event.total : 0)
    handler(Math.min(100, Math.max(0, Math.round(ratio * 100))))
  }
}