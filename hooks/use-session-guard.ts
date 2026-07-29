"use client"

import { useEffect } from "react"

import { endClientSession } from "@/lib/session"
import { systemToast } from "@/lib/toast"
import { useAuthStore } from "@/store/auth.store"

/** Warn this long before the token expires. */
const WARNING_BEFORE_MS = 60_000
/** Max delay a single setTimeout can hold reliably (~24.8 days). */
const MAX_TIMEOUT_MS = 2_147_483_647

/**
 * Proactively logs the user out the moment the stored JWT expires, with a
 * warning shortly before. Complements the reactive 401 handling in the axios
 * interceptor. Re-checks on tab focus / visibility change so a session that
 * lapsed while the tab was backgrounded is caught immediately.
 */
export function useSessionGuard(): void {
  // Keyed on `expiresAt` alone, not the token: the token is deliberately not
  // persisted (see `store/auth.store.ts`), so after a page refresh it is null
  // even though the session is still valid via the httpOnly cookie. Gating on
  // it here would silently disable expiry handling for every reloaded tab.
  const expiresAt = useAuthStore((s) => s.expiresAt)

  useEffect(() => {
    if (expiresAt === null) return

    let warned = false
    const timers: ReturnType<typeof setTimeout>[] = []

    // No refresh endpoint exists, so "sign in again" must end the current
    // session first — otherwise the middleware bounces an authenticated user
    // back from /login to /dashboard.
    const goToLogin = () => {
      void endClientSession("manual")
    }

    const clearTimers = () => {
      for (const t of timers) clearTimeout(t)
      timers.length = 0
    }

    /** Returns true (and ends the session) if already expired. */
    const expiredNow = (): boolean => {
      if (expiresAt - Date.now() <= 0) {
        void endClientSession("expired")
        return true
      }
      return false
    }

    const arm = () => {
      clearTimers()
      if (expiredNow()) return

      const remaining = expiresAt - Date.now()

      const warnIn = remaining - WARNING_BEFORE_MS
      if (!warned) {
        if (warnIn <= 0) {
          warned = true
          systemToast.sessionExpiringSoon(goToLogin)
        } else {
          timers.push(
            setTimeout(() => {
              warned = true
              systemToast.sessionExpiringSoon()
            }, Math.min(warnIn, MAX_TIMEOUT_MS)),
          )
        }
      }

      // Re-arm if the remaining time exceeds a single timer's reliable range.
      timers.push(
        setTimeout(
          () => {
            if (!expiredNow()) arm()
          },
          Math.min(remaining, MAX_TIMEOUT_MS),
        ),
      )
    }

    arm()

    const recheck = () => {
      if (document.visibilityState !== "visible") return
      if (!expiredNow()) arm()
    }
    document.addEventListener("visibilitychange", recheck)
    window.addEventListener("focus", recheck)

    return () => {
      clearTimers()
      document.removeEventListener("visibilitychange", recheck)
      window.removeEventListener("focus", recheck)
    }
  }, [expiresAt])
}
