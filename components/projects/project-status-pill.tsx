"use client"

import { NS } from "@/components/projects/projects-strings"
import { cn } from "@/lib/utils"
import type { ProjectStatus } from "@/types/projects"

const base =
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium"

export function ProjectStatusPill({
  status,
  className,
}: {
  status: ProjectStatus | undefined
  className?: string
}) {
  const isCompleted = status === "COMPLETED"
  return (
    <span
      className={cn(
        base,
        isCompleted
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        className,
      )}
    >
      {isCompleted ? NS.status.completed : NS.status.ongoing}
    </span>
  )
}

export function ProjectStatusPillSidebar({
  status,
}: {
  status: ProjectStatus | undefined
}) {
  const isCompleted = status === "COMPLETED"
  return (
    <div
      className={cn(
        "w-full rounded-md py-1.5 text-center text-xs font-medium",
        isCompleted
          ? "bg-primary/10 text-primary"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      )}
    >
      {isCompleted ? NS.status.completed : NS.status.ongoing}
    </div>
  )
}
