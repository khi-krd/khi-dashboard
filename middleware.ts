import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login"]

/** Let API traffic through before auth — otherwise login POST never reaches the proxy. */
function mayProceedWithoutSessionCookie(pathname: string): boolean {
  if (pathname === "/api/auth/session") return true
  if (pathname === "/railway-proxy" || pathname.startsWith("/railway-proxy/"))
    return true
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (mayProceedWithoutSessionCookie(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get("auth_token")?.value
  const hasSessionCookie = Boolean(token)

  if (hasSessionCookie && PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!hasSessionCookie && !PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}
