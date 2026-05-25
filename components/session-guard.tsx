"use client"

import { useSessionGuard } from "@/hooks/use-session-guard"

/** Headless guard that auto-logs-out on JWT expiry. Mount once in the app. */
export function SessionGuard() {
  useSessionGuard()
  return null
}
