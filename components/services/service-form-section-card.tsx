"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function ServiceFormSectionCard({
  title,
  badge,
  fieldLabel,
  children,
  className,
}: {
  title: string
  badge?: ReactNode
  fieldLabel?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "border-border bg-card space-y-4 rounded-xl border p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        {badge}
      </div>
      {fieldLabel ? (
        <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wide">
          {fieldLabel}
        </span>
      ) : null}
      {children}
    </section>
  )
}
