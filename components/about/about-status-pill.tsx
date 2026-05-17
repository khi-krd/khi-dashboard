"use client"

import {
  ArchiveBoxIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline"

import { NS } from "@/components/about/about-strings"
import { cn } from "@/lib/utils"
import type { AboutStatus } from "@/types/about"

export const STATUS_VARIANTS = {
  DRAFT: {
    label: NS.status.draft,
    icon: DocumentTextIcon,
    className: "bg-muted text-muted-foreground border-border",
    helper: NS.status.draft_helper,
  },
  ACTIVE: {
    label: NS.status.active,
    icon: CheckCircleIcon,
    className: "bg-primary/10 text-primary border-primary/20",
    helper: NS.status.active_helper,
  },
  ARCHIVED: {
    label: NS.status.archived,
    icon: ArchiveBoxIcon,
    className:
      "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
    helper: NS.status.archived_helper,
  },
} as const

export function AboutStatusPill({
  status,
  className,
  size = "default",
}: {
  status: AboutStatus
  className?: string
  size?: "default" | "large"
}) {
  const variant = STATUS_VARIANTS[status] ?? STATUS_VARIANTS.DRAFT
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
