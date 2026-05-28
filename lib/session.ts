import { systemToast } from "@/lib/toast"
import { useAuthStore } from "@/store/auth.store"

/** Best-effort removal of the server-side HttpOnly auth cookie.
 *
 * - `keepalive: true` lets the request complete even if the page navigates
 *   away (e.g. the `window.location.assign("/login")` immediately after).
 * - An AbortController-backed timeout guarantees we never block the logout
 *   redirect on a hung network call. */
export async function destroyServerSession(): Promise<void> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 3_000)
  try {
    await fetch("/api/auth/session", {
      method: "DELETE",
      credentials: "same-origin",
      keepalive: true,
      signal: ctrl.signal,
    })
  } catch {
    /* ignore — local state is cleared regardless */
  } finally {
    clearTimeout(timer)
  }
}

export type EndSessionReason = "manual" | "expired" | "deleted"

let ending = false

/**
 * Tear down the client session and redirect to /login. Idempotent within a
 * page lifetime so overlapping triggers (expiry timer + focus re-check, etc.)
 * cannot fire the toast/redirect twice.
 */
export async function endClientSession(
  reason: EndSessionReason = "manual",
): Promise<void> {
  if (ending) return
  ending = true

  useAuthStore.getState().clearAuth()
  await destroyServerSession()

  if (reason === "expired") systemToast.sessionExpired()
  else if (reason === "deleted") systemToast.deleteSuccess()
  else systemToast.logoutSuccess()

  if (typeof window !== "undefined") {
    window.location.assign("/login")
  }
}
