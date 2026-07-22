"use client"

import { NS } from "@/components/donations/donations-strings"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DONATION_STATUSES, type DonationStatus } from "@/types/donations"

export function DonationStatusSelect({
  value,
  onValueChange,
  id,
}: {
  value: DonationStatus
  onValueChange: (status: DonationStatus) => void
  id?: string
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as DonationStatus)}>
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DONATION_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {NS.status[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function DonationStatusFilterSelect({
  value,
  onValueChange,
}: {
  value: DonationStatus | "all"
  onValueChange: (value: DonationStatus | "all") => void
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as DonationStatus | "all")}>
      <SelectTrigger className="bg-background h-9 w-40">
        <SelectValue placeholder={NS.filter.status} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{NS.status.all}</SelectItem>
        {DONATION_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {NS.status[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
