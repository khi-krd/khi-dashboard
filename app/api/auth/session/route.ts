import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "auth_token"

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (body === null || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const rec = body as Record<string, unknown>
  const token = typeof rec.token === "string" ? rec.token : ""
  if (token.length < 10) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  let maxAge = 60 * 60 * 24 * 7
  if (typeof rec.expiresIn === "number" && rec.expiresIn > 0) {
    const seconds = Math.min(Math.floor(rec.expiresIn / 1000), 60 * 60 * 24 * 365)
    if (seconds > 0) maxAge = seconds
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  })
  return res
}

/**
 * Returns the session JWT so browser JS can send it as a Bearer header.
 *
 * Exists for one reason: Vercel rejects any request whose body exceeds 4.5MB
 * (`FUNCTION_PAYLOAD_TOO_LARGE`) before the `/railway-proxy` function ever
 * runs, so multipart uploads go straight to the backend instead. The httpOnly
 * cookie cannot cross origins, and the Zustand copy of the token is
 * memory-only — after a page refresh this endpoint is the only way to
 * re-arm the Authorization header for those direct uploads.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value?.trim()
  if (!token) {
    return NextResponse.json({ error: "No session" }, { status: 401 })
  }
  return NextResponse.json({ token })
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return res
}
