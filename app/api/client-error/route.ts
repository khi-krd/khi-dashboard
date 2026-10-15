import { NextResponse } from "next/server"

/**
 * Receives client-side error-boundary reports and writes them to stdout so
 * `docker logs khi-dashboard-1` shows the real exception behind the generic
 * error page — the browser console is not reachable from the server.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    console.error(
      "[client-error]",
      JSON.stringify({
        name: body.name,
        message: typeof body.message === "string" ? body.message.slice(0, 500) : undefined,
        digest: body.digest,
        url: body.url,
        stack: typeof body.stack === "string" ? body.stack.slice(0, 2000) : undefined,
        ua: request.headers.get("user-agent") ?? undefined,
      }),
    )
  } catch {
    // Even a malformed body should not 500 the error page.
  }
  return new NextResponse(null, { status: 204 })
}
