import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import type { ReactNode } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { DashboardSoundPlayer } from "@/components/sounds/dashboard-sound-player"
import { DashboardBreadcrumbs } from "@/components/dashboard-breadcrumbs"
import { ThemeToggleButton } from "@/components/examples/c-button-43"
import { FullscreenToggleButton } from "@/components/fullscreen-toggle-button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <SidebarTrigger className="-ms-1" />
              <Separator
                orientation="vertical"
                className="me-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <DashboardBreadcrumbs />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggleButton />
              <FullscreenToggleButton />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pb-24">
            {children}
            <DashboardSoundPlayer />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </NextIntlClientProvider>
  )
}
