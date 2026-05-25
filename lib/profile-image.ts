import type { UserResponse } from "@/types/auth"

type AvatarFields = Pick<UserResponse, "imageUrl" | "profileImage">

/**
 * Resolve a usable avatar `src`. OAuth `imageUrl` is already absolute; a local
 * `profileImage` is a server-relative path (e.g. `/uploads/avatars/x.png`) and
 * must be prefixed with the API base (the same-origin `/railway-proxy` or a
 * full API URL) so it resolves to the backend rather than the dashboard origin.
 */
export function resolveAvatarSrc(user: AvatarFields | null | undefined): string {
  const oauthUrl = user?.imageUrl?.trim()
  if (oauthUrl) return oauthUrl

  const path = user?.profileImage?.trim()
  if (!path) return ""
  if (/^https?:\/\//i.test(path)) return path

  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "")
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalized}`
}
