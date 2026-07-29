"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import type { ComponentType } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { queryClient } from "@/lib/query-client"

/**
 * Devtools live in a devDependency, so a static import breaks any production
 * install that omits dev deps. `NODE_ENV` is statically replaced at build time,
 * so in a production build this whole branch — and the import with it — is
 * eliminated rather than merely code-split.
 */
const ReactQueryDevtools: ComponentType<{ initialIsOpen?: boolean }> =
  process.env.NODE_ENV === "production"
    ? () => null
    : dynamic(
        () =>
          import("@tanstack/react-query-devtools").then(
            (m) => m.ReactQueryDevtools,
          ),
        { ssr: false },
      )

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
