/**
 * Same-origin font proxy for the branding screen's live preview.
 *
 * The uploaded typeface sits in the media bucket, which sends no CORS headers,
 * and the dashboard CSP is `font-src 'self' data:` — so the file must be
 * fetched server-side and re-served from this origin. The website has its own
 * copy of this route; the two are deliberately independent.
 */

export const dynamic = "force-dynamic"

/** Font files are small — refuse anything that clearly is not one. */
const MAX_BYTES = 8 * 1024 * 1024
const TIMEOUT_MS = 15_000

const MIME_BY_EXT: Record<string, string> = {
  woff2: "font/woff2",
  woff: "font/woff",
  ttf: "font/ttf",
  otf: "font/otf",
}

function allowedFontHosts(): Set<string> {
  const hosts = new Set<string>([
    // The media bucket the website itself is built to load from.
    "s3-khiwebsite.s3.us-east-1.amazonaws.com",
  ])
  for (const envUrl of [
    process.env.API_PROXY_TARGET,
    process.env.NEXT_PUBLIC_API_DIRECT_URL,
  ]) {
    if (!envUrl) continue
    try {
      hosts.add(new URL(envUrl).hostname)
    } catch {
      // ignore malformed env
    }
  }
  return hosts
}

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src")

  let parsed: URL | null = null
  try {
    parsed = src ? new URL(src) : null
  } catch {
    parsed = null
  }
  if (
    !parsed ||
    parsed.protocol !== "https:" ||
    !allowedFontHosts().has(parsed.hostname)
  ) {
    return new Response("Forbidden", { status: 403 })
  }

  const ext = parsed.pathname.split(".").pop()?.toLowerCase() ?? ""
  const mime = MIME_BY_EXT[ext]
  if (!mime) {
    return new Response("Unsupported font format", { status: 415 })
  }

  try {
    const response = await fetch(parsed, {
      cache: "no-store",
      // Manual: an allowlisted host could still 302 to an internal address.
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (response.status >= 300 && response.status < 400) {
      return new Response("Forbidden", { status: 403 })
    }
    if (!response.ok) {
      return new Response("Not found", { status: response.status })
    }

    const declared = Number.parseInt(
      response.headers.get("content-length") ?? "",
      10,
    )
    if (Number.isFinite(declared) && declared > MAX_BYTES) {
      return new Response("Font too large", { status: 413 })
    }

    const body = await response.arrayBuffer()
    if (body.byteLength > MAX_BYTES) {
      return new Response("Font too large", { status: 413 })
    }

    return new Response(body, {
      headers: {
        // The MIME is derived from the extension, not echoed from upstream —
        // the bucket may serve the object as application/octet-stream, which
        // nosniff would then reject as a font.
        "Content-Type": mime,
        "Content-Length": String(body.byteLength),
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return new Response("Failed to fetch font", { status: 502 })
  }
}
