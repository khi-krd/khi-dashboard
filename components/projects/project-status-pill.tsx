"use client"

import { NS } from "@/components/projects/projects-strings"
import { cn } from "@/lib/utils"
import type { ProjectStatus } from "@/types/projects"
import { normalizeProjectStatus } from "@/types/projects"

const base =
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium"

const SIDEBAR_CLASS: Record<ProjectStatus, string> = {
  ACTIVE: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  COMPLETED: "bg-primary/10 text-primary",
  ARCHIVED: "bg-muted text-muted-foreground",
}

const PILL_CLASS: Record<ProjectStatus, string> = {
  ACTIVE:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  COMPLETED: "border-primary/20 bg-primary/10 text-primary",
  ARCHIVED: "border-border bg-muted text-muted-foreground",
}

const LABEL: Record<ProjectStatus, string> = {
  ACTIVE: NS.status.active,
  COMPLETED: NS.status.completed,
  ARCHIVED: NS.status.archived,
}

export function ProjectStatusPill({
  status,
  className,
}: {
  status: ProjectStatus | undefined
  className?: string
}) {
  const resolved = normalizeProjectStatus(status)
  return (
    <span className={cn(base, PILL_CLASS[resolved], className)}>
      {LABEL[resolved]}
    </span>
  )
}

export function ProjectStatusPillSidebar({
  status,
}: {
  status: ProjectStatus | undefined
}) {
  const resolved = normalizeProjectStatus(status)
  return (
    <div
      className={cn(
        "w-full rounded-md py-1.5 text-center text-xs font-medium",
        SIDEBAR_CLASS[resolved],
      )}
    >
      {LABEL[resolved]}
    </div>
  )
}
