"use client"

import { endClientSession } from "@/lib/session"
import { logout } from "@/services/auth.service"

export function useLogout() {
  async function handleLogout() {
    try {
      await logout()
    } catch {
      // ignore server error — clear locally regardless
    } finally {
      await endClientSession("manual")
    }
  }

  return { handleLogout }
}
