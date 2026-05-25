import { type NextRequest, NextResponse } from "next/server"

/** Headers to forward to Spring; omit Host/Origin so fetch() sets Host to the API host. */
const FORWARD_REQUEST_HEADERS = [
  "content-type",
  "authorization",
  "accept",
  "accept-language",
] as const

function getTargetBase(): string | null {
  const raw = process.env.API_PROXY_TARGET?.trim().replace(/\/+$/, "")
  return raw || null
}

/** Prefer the httpOnly session cookie over the client Authorization header. */
function buildUpstreamHeaders(req: NextRequest): Headers {
  const headers = new Headers()
  for (const name of FORWARD_REQUEST_HEADERS) {
    if (name === "authorization") continue
    const value = req.headers.get(name)
    if (value) headers.set(name, value)
  }

  const cookieToken = req.cookies.get("auth_token")?.value?.trim()
  if (cookieToken) {
    headers.set("authorization", `Bearer ${cookieToken}`)
  } else {
    const auth = req.headers.get("authorization")
    if (auth) headers.set("authorization", auth)
  }

  return headers
}

function buildProxyResponse(upstream: Response): NextResponse {
  const res = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
  })

  const hopByHop = new Set([
    "connection",
    "keep-alive",
    "transfer-encoding",
    "content-encoding",
  ])

  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (lower === "set-cookie") return
    if (hopByHop.has(lower)) return
    if (!res.headers.has(key)) {
      res.headers.set(key, value)
    }
  })

  const withSetCookie = upstream.headers as Headers & {
    getSetCookie?: () => string[]
  }
  for (const cookie of withSetCookie.getSetCookie?.() ?? []) {
    res.headers.append("Set-Cookie", cookie)
  }

  return res
}

async function proxy(req: NextRequest, pathSegments: string[]) {
  const targetBase = getTargetBase()
  if (!targetBase) {
    return NextResponse.json(
      { error: "API_PROXY_TARGET is not set" },
      { status: 502 },
    )
  }

  const subPath = pathSegments.join("/")
  const dest = `${targetBase}/${subPath}${new URL(req.url).search}`

  const headers = buildUpstreamHeaders(req)

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer()
  }

  // Measure how long the upstream backend takes to respond (time-to-first-byte
  // from the proxy's perspective). This isolates real backend latency from the
  // extra proxy hop / client network.
  const start = performance.now()
  let upstream: Response
  try {
    upstream = await fetch(dest, init)
  } catch (err) {
    const ms = Math.round(performance.now() - start)
    console.error(
      `[railway-proxy] ${req.method} /${subPath} FAILED after ${ms}ms`,
      err,
    )
    throw err
  }
  const ms = Math.round(performance.now() - start)
  console.log(
    `[railway-proxy] ${req.method} /${subPath} -> ${upstream.status} in ${ms}ms`,
  )

  const res = buildProxyResponse(upstream)
  // Surfaces in DevTools → Network → Timing ("Server Timing" section).
  res.headers.set("Server-Timing", `upstream;desc="backend";dur=${ms}`)
  return res
}

type RouteCtx = { params: Promise<{ path?: string[] }> }

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params
  return proxy(req, path ?? [])
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params
  return proxy(req, path ?? [])
}

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params
  return proxy(req, path ?? [])
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params
  return proxy(req, path ?? [])
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params
  return proxy(req, path ?? [])
}

export async function OPTIONS(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params
  return proxy(req, path ?? [])
}
