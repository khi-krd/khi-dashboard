import type { Metadata, Viewport } from "next"
import { headers } from "next/headers"
import { Geist_Mono } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Providers from "@/app/providers"
import { notoNaskhArabic, notoSansArabic, vazirmatn } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: "داشبۆردی KHI",
    template: "%s · داشبۆردی KHI",
  },
  description: "سیستەمی بەڕێوەبردنی ناوەڕۆکی ماڵپەڕی KHI",
  applicationName: "KHI Dashboard",
  // This is a private admin panel — it must never be indexed.
  robots: { index: false, follow: false, nocache: true },
}

/**
 * The CSP in `proxy.ts` carries a per-request nonce, and Next can only stamp
 * that nonce onto its script tags while rendering dynamically. Prerendered HTML
 * would ship script tags whose nonce cannot match the response header, and
 * `'strict-dynamic'` would then block every one of them — a blank, dead page.
 * Nothing here is publicly cacheable anyway: every route sits behind the auth
 * gate.
 */
export const dynamic = "force-dynamic"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const messages = await getMessages()
  // `next-themes` renders its own inline <script> to set the theme class before
  // paint. Next stamps its nonce onto the script tags it emits itself, but not
  // onto a third party's, so without this the CSP in `proxy.ts` — which is
  // nonce + 'strict-dynamic' and therefore allows no unnonced inline script —
  // blocks it and the browser logs a script-src-elem violation.
  const nonce = (await headers()).get("x-nonce") ?? undefined

  return (
    <html
      lang="ckb"
      dir="rtl"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        notoNaskhArabic.variable,
        vazirmatn.variable,
        notoSansArabic.variable,
      )}
    >
      <body>
        <Providers>
          <NextIntlClientProvider locale="ckb" messages={messages} timeZone="Asia/Baghdad">
            <ThemeProvider nonce={nonce}>{children}</ThemeProvider>
          </NextIntlClientProvider>
          <Toaster
            position="bottom-left"
            dir="rtl"
            richColors
            closeButton
            duration={4000}
            theme="system"
          />
        </Providers>
      </body>
    </html>
  )
}
