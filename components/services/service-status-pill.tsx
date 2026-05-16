"use client"

import { NS } from "@/components/services/services-strings"
import { formatNewsDateLong } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { ServiceDto } from "@/types/services"
import { serviceDisplayStatus } from "@/types/services-ui"

const base =
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium"

function statusStyles(status: ReturnType<typeof serviceDisplayStatus>) {
  switch (status) {
    case "published":
      return "border-primary/20 bg-primary/10 text-primary"
    case "scheduled":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
    case "draft":
      return "border-border bg-muted text-muted-foreground"
    case "inactive":
      return "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400"
  }
}

function statusLabel(status: ReturnType<typeof serviceDisplayStatus>) {
  switch (status) {
    case "published":
      return NS.status.published
    case "scheduled":
      return NS.status.scheduled
    case "draft":
      return NS.status.draft
    case "inactive":
      return NS.status.inactive
  }
}

export function serviceStatusContextLine(
  service: Pick<ServiceDto, "active" | "publishedAt">,
): string {
  const status = serviceDisplayStatus(service)
  const dateStr = service.publishedAt
    ? formatNewsDateLong(service.publishedAt)
    : ""
  switch (status) {
    case "published":
      return NS.status.contextPublished(dateStr)
    case "scheduled":
      return NS.status.contextScheduled(dateStr)
    case "draft":
      return NS.status.contextDraft
    case "inactive":
      return NS.status.contextInactive
  }
}

export function ServiceStatusPill({
  service,
  className,
}: {
  service: Pick<ServiceDto, "active" | "publishedAt">
  className?: string
}) {
  const status = serviceDisplayStatus(service)
  return (
    <span className={cn(base, statusStyles(status), className)}>
      {statusLabel(status)}
    </span>
  )
}

export function ServiceStatusPillSidebar({
  service,
}: {
  service: Pick<ServiceDto, "active" | "publishedAt">
}) {
  const status = serviceDisplayStatus(service)
  return (
    <div
      className={cn(
        "w-full rounded-md py-1.5 text-center text-xs font-medium",
        status === "published" && "bg-primary/10 text-primary",
        status === "scheduled" &&
          "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        status === "draft" && "bg-muted text-muted-foreground",
        status === "inactive" &&
          "bg-slate-500/10 text-slate-600 dark:text-slate-400",
      )}
    >
      {statusLabel(status)}
    </div>
  )
}

export function serviceStatusInlineWord(
  service: Pick<ServiceDto, "active" | "publishedAt">,
): string {
  return statusLabel(serviceDisplayStatus(service))
}
