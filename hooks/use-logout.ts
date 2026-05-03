"use client"

import { systemToast } from "@/lib/toast"
import { logout } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"

export function useLogout() {
  async function handleLogout() {
    try {
      await logout()
    } catch {
      // ignore server error — clear locally regardless
    } finally {
      useAuthStore.getState().clearAuth()
      try {
        await fetch("/api/auth/session", {
          method: "DELETE",
          credentials: "same-origin",
        })
      } catch {
        /* ignore */
      }
      systemToast.logoutSuccess()
      window.location.assign("/login")
    }
  }

  return { handleLogout }
}
