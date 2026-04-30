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
