import createNextIntlPlugin from "next-intl/plugin"

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Same-origin API proxy: `API_PROXY_TARGET` + `NEXT_PUBLIC_API_URL=/railway-proxy`
   * is handled by `app/railway-proxy/[[...path]]/route.ts` so upstream requests use
   * the correct Host header (Next rewrites to external URLs can send Host: localhost and
   * get 403 from Railway edge).
   */
}

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

export default withNextIntl(nextConfig)
