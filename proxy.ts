import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { buildCsp } from "@/lib/csp"

const COOKIE_NAME = "auth_token"

/**
 * Read `exp` out of a JWT without verifying the signature.
 *
 * The signing key lives with the backend and is deliberately not shared with
 * this app, so the edge cannot prove a token is authentic — only the API can.
 * What it *can* do for free is reject tokens that are structurally invalid or
 * already expired, which stops a stale cookie from being waved through to a
 * dashboard that will only 401 a moment later.
 *
 * Returns null when the token is unreadable or carries no usable `exp`.
 */
function readTokenExpiry(token: string): number | null {
  const parts = token.split(".")
  if (parts.length !== 3) return null

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "=",
    )
    const decoded: unknown = JSON.parse(atob(padded))
    if (typeof decoded !== "object" || decoded === null) return null
    const exp = (decoded as { exp?: unknown }).exp
    return typeof exp === "number" && Number.isFinite(exp) ? exp : null
  } catch {
    return null
  }
}

/** A token is usable if it parses and has not expired. */
function isTokenUsable(token: string | undefined): boolean {
  if (!token) return false
  const exp = readTokenExpiry(token)
  // No readable `exp` — let it through and let the API be the judge, rather
  // than locking users out over a token shape we didn't anticipate.
  if (exp === null) return true
  return exp * 1000 > Date.now()
}

/** Strip the stale cookie so the next request doesn't repeat this dance. */
function redirectClearingCookie(to: string, request: NextRequest) {
  const res = NextResponse.redirect(new URL(to, request.url))
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return res
}

export function proxy(request: NextRequest) {
  const rawToken = request.cookies.get(COOKIE_NAME)?.value
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === "/login"
  const authed = isTokenUsable(rawToken)

  // Present but unusable: expired or malformed. Clear it, then treat as logged
  // out — otherwise the cookie keeps bouncing the user between /login and
  // /dashboard forever.
  if (rawToken && !authed) {
    return redirectClearingCookie("/login", request)
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(authed ? "/dashboard" : "/login", request.url),
    )
  }

  if (!authed && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (authed && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Mint a per-request nonce and hand it to Next via the request header — that
  // is how it knows to stamp `nonce=` onto the script tags it emits. The same
  // policy goes out on the response for the browser to enforce.
  const nonce = crypto.randomUUID().replace(/-/g, "")
  const csp = buildCsp(nonce, process.env.NODE_ENV !== "production")

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", csp)

  const res = NextResponse.next({ request: { headers: requestHeaders } })
  res.headers.set("Content-Security-Policy", csp)
  return res
}

export const config = {
  /**
   * The trailing `.*\\.[\\w]+$` exclusion covers every static file in `public/`
   * — robots.txt, the logo, icons, anything added later.
   *
   * They have to be excluded: the auth gate answers an unauthenticated request
   * with a 307 to /login, and `next/image` fetches the source through this same
   * server. It would receive the login page instead of a PNG and fail with
   * "The requested resource isn't a valid image". Files under `public/` are
   * served to anyone by definition, so gating them was never protecting
   * anything — only breaking them.
   *
   * Dashboard routes never contain a dot, so nothing authenticated slips past.
   */
  matcher: [
    "/((?!api|_next/static|_next/image|railway-proxy|.*\\.[\\w]+$).*)",
  ],
}
