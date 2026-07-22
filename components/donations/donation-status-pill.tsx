"use client"

import { Badge } from "@/components/ui/badge"
import { NS } from "@/components/donations/donations-strings"
import { cn } from "@/lib/utils"
import { isDonationStatus, type DonationStatus } from "@/types/donations"

const VARIANT: Record<
  DonationStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  NEW: "outline",
  PENDING: "outline",
  IN_REVIEW: "default",
  APPROVED: "secondary",
  COMPLETED: "secondary",
  REJECTED: "destructive",
  CLOSED: "outline",
}

function resolveStatus(status?: string | null): DonationStatus {
  const upper = status?.toUpperCase()
  if (upper && isDonationStatus(upper)) return upper
  return "PENDING"
}

function statusLabel(status: DonationStatus): string {
  return NS.status[status] ?? status
}

export function DonationStatusPill({
  status,
  className,
}: {
  status?: string | null
  className?: string
}) {
  const resolved = resolveStatus(status)
  return (
    <Badge variant={VARIANT[resolved]} className={cn("font-normal", className)}>
      {statusLabel(resolved)}
    </Badge>
  )
}
