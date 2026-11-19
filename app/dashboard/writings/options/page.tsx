import { Suspense } from "react"

import { ManagedOptionsTabs } from "@/components/writings/options/managed-options-tabs"
import { OPTION_PAGE } from "@/components/writings/options/managed-options-strings"
import {
  WritingBreadcrumbBar,
  dashboardWritingsCrumbHref,
} from "@/components/writings/writing-breadcrumb"

export default function WritingOptionsPage() {
  return (
    <div dir="rtl" className="space-y-8 px-4 py-6 lg:px-6">
      <WritingBreadcrumbBar
        segments={[
          {
            label: OPTION_PAGE["writing-types"].title ? "داشبۆرد" : "",
            href: dashboardWritingsCrumbHref(),
          },
          { label: "نووسراوەکان", href: "/dashboard/writings" },
          { label: "جۆری نووسین · چاپ · زمان" },
        ]}
      />

      <header className="border-border/60 border-b pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          جۆری نووسین، چاپ و زمانی کتێب
        </h1>
        <p className="text-muted-foreground mt-1.5 max-w-xl text-sm">
          {OPTION_PAGE["writing-types"].subtitle}
        </p>
      </header>

      <Suspense>
        <ManagedOptionsTabs />
      </Suspense>
    </div>
  )
}
