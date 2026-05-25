import { systemToast } from "@/lib/toast"
import { useAuthStore } from "@/store/auth.store"

/** Best-effort removal of the server-side HttpOnly auth cookie. */
export async function destroyServerSession(): Promise<void> {
  try {
    await fetch("/api/auth/session", {
      method: "DELETE",
      credentials: "same-origin",
    })
  } catch {
    /* ignore — local state is cleared regardless */
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
