"use client"

import {
  CheckCircleIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline"

import { NS } from "@/components/contact/contact-strings"
import { cn } from "@/lib/utils"

const VARIANTS = {
  active: {
    label: NS.status.active,
    icon: CheckCircleIcon,
    className: "bg-primary/10 text-primary border-primary/20",
    helper: NS.status.active_helper,
  },
  inactive: {
    label: NS.status.inactive,
    icon: NoSymbolIcon,
    className: "bg-muted text-muted-foreground border-border",
    helper: NS.status.inactive_helper,
  },
} as const

export function ContactStatusPill({
  active,
  className,
  size = "default",
}: {
  active?: boolean
  className?: string
  size?: "default" | "large"
}) {
  const isActive = active !== false
  const variant = isActive ? VARIANTS.active : VARIANTS.inactive
  const Icon = variant.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-medium",
        size === "large" ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-xs",
        variant.className,
        className,
      )}
    >
      <Icon className={size === "large" ? "size-4" : "size-3"} aria-hidden />
      {variant.label}
    </span>
  )
}

export function contactStatusHelper(active?: boolean): string {
  return active !== false ? VARIANTS.active.helper : VARIANTS.inactive.helper
}
