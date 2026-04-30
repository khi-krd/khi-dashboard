import { Geist_Mono } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { notoNaskhArabic, notoSansArabic, vazirmatn } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const messages = await getMessages()

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
        <NextIntlClientProvider locale="ckb" messages={messages} timeZone="Asia/Baghdad">
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
        <Toaster
          position="bottom-left"
          dir="rtl"
          richColors
          closeButton
          duration={4000}
          theme="system"
        />
      </body>
    </html>
  )
}
