/**
 * Content-Security-Policy for the dashboard.
 *
 * The nonce is minted per request in `proxy.ts`. Next.js picks it up from the
 * `Content-Security-Policy` request header and stamps it onto its own script
 * tags; `'strict-dynamic'` then covers the chunks those scripts load, so no
 * host allowlist is needed for scripts.
 */
export function buildCsp(nonce: string, isDev: boolean): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],

    // 'strict-dynamic' makes browsers ignore 'self' and any host list here —
    // trust flows from the nonce to whatever those scripts load. Dev needs
    // 'unsafe-eval' for Turbopack's HMR runtime.
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],

    // Nonce-ing styles is not workable here: Next injects inline <style> during
    // streaming and several components set inline style attributes. Inline
    // style is a far weaker vector than inline script, so this is the standard
    // trade.
    "style-src": ["'self'", "'unsafe-inline'"],

    // Remote covers: S3 buckets, YouTube thumbnails, Vimeo. blob:/data: cover
    // local upload previews before the file reaches the server.
    "img-src": ["'self'", "blob:", "data:", "https:"],

    // Audio and video are served from S3; blob: is used while previewing a
    // just-picked local file.
    "media-src": ["'self'", "blob:", "data:", "https:"],

    "font-src": ["'self'", "data:"],

    // Same-origin only — every API call goes through /railway-proxy. ws: is
    // Turbopack's dev HMR socket.
    "connect-src": ["'self'", ...(isDev ? ["ws:", "wss:"] : [])],

    // Deliberately broad. Three iframe sources have to work: S3-hosted PDF
    // previews, YouTube/Vimeo players, and `mapEmbedUrl`, which is arbitrary
    // admin-entered content. Restricting to a host list would silently break
    // map embeds. `https:` still blocks data: and javascript: frames.
    "frame-src": ["'self'", "https:"],

    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  }

  const serialized = Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ")

  return isDev ? serialized : `${serialized}; upgrade-insecure-requests`
}
