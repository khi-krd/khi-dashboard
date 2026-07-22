"use client"

import { Badge } from "@/components/ui/badge"
import { NS } from "@/components/donations/donations-strings"
import { cn } from "@/lib/utils"
import type { DonationStatus } from "@/types/donations"

const VARIANT: Record<
  DonationStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PENDING: "outline",
  APPROVED: "secondary",
  REJECTED: "destructive",
}

export function DonationStatusPill({
  status,
  className,
}: {
  status?: DonationStatus
  className?: string
}) {
  const resolved = status ?? "PENDING"
  return (
    <Badge variant={VARIANT[resolved]} className={cn("font-normal", className)}>
      {NS.status[resolved]}
    </Badge>
  )
}
