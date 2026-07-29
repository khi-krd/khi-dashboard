import createNextIntlPlugin from "next-intl/plugin"

/**
 * Static headers applied to every response. The Content-Security-Policy is NOT
 * here — it carries a per-request nonce and is set in `proxy.ts` via `lib/csp.ts`.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emits `.next/standalone/server.js` with only the traced runtime deps, which
  // is what the Docker runner stage copies. See Dockerfile.
  output: "standalone",
  poweredByHeader: false,
  compiler: {
    // Strip debug logging from production builds; keep error/warn so real
    // failures still reach the container logs.
    removeConsole: { exclude: ["error", "warn"] },
  },
  experimental: {
    optimizePackageImports: [
      "@heroicons/react",
      "@hugeicons/react",
      "@hugeicons/core-free-icons",
      "recharts",
      "@tanstack/react-table",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3-khiwebsite.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "vumbnail.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
  /**
   * Same-origin API proxy: `API_PROXY_TARGET` + `NEXT_PUBLIC_API_URL=/railway-proxy`
   * is handled by `app/railway-proxy/[[...path]]/route.ts` so upstream requests use
   * the correct Host header (Next rewrites to external URLs can send Host: localhost and
   * get 403 from Railway edge).
   */
}

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

export default withNextIntl(nextConfig)
