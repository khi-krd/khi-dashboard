import Link from "next/link"

import { BrandingPanel } from "@/components/settings/branding-panel"
import { NS } from "@/components/settings/settings-strings"

export default function BrandingSettingsPage() {
  return (
    <div dir="rtl" className="mx-auto max-w-3xl space-y-8 px-4 py-6 lg:px-6">
      <nav
        className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm"
        aria-label="breadcrumb"
      >
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          {NS.breadcrumb.dashboard}
        </Link>
        <span aria-hidden className="text-muted-foreground/50">
          /
        </span>
        <span className="text-foreground font-medium">
          {NS.breadcrumb.branding}
        </span>
      </nav>

      <header className="border-border/60 space-y-2 border-b pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {NS.page.title}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          {NS.page.subtitle}
        </p>
      </header>

      <BrandingPanel />
    </div>
  )
}
