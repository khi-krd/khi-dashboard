"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { DonationStatusPill } from "@/components/donations/donation-status-pill"
import { NS } from "@/components/donations/donations-strings"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { useUpdateFinancialDonationStatusMutation } from "@/hooks/useDonations"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { formatFullTimestampKu } from "@/lib/news-relative-time"
import { toastError } from "@/lib/toast"
import type { FinancialDonationRow } from "@/types/donations-ui"
import type { DonationStatus } from "@/types/donations"

const STATUSES: DonationStatus[] = ["PENDING", "APPROVED", "REJECTED"]

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="text-sm">{value}</div>
    </div>
  )
}

function formatAmount(amount: number | null | undefined, currency?: string | null) {
  if (amount == null || !Number.isFinite(amount)) return "—"
  const cur = currency?.trim() || "IQD"
  return `${formatCkbDigits(amount)} ${cur}`
}

export function DonationsFinancialSheet({
  open,
  onOpenChange,
  row,
  onStatusUpdated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: FinancialDonationRow | null
  onStatusUpdated?: () => void
}) {
  const updateMut = useUpdateFinancialDonationStatusMutation()
  const [statusDraft, setStatusDraft] = useState<DonationStatus>("PENDING")

  useEffect(() => {
    if (row) setStatusDraft(row.status ?? "PENDING")
  }, [row])

  if (!row) return null

  const currentStatus = row.status ?? "PENDING"

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
  }

  function handleSaveStatus() {
    updateMut.mutate(
      { id: row!.id, status: statusDraft },
      {
        onSuccess: () => {
          toast.success(NS.toast.statusUpdated)
          onStatusUpdated?.()
          onOpenChange(false)
        },
        onError: () => toastError(NS.error.generic),
      },
    )
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>
            {NS.financial.sheetTitle(formatCkbDigits(row.id))}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
          <div className="flex items-center gap-2">
            <DonationStatusPill status={currentStatus} />
          </div>

          <DetailRow label={NS.financial.donorName} value={row.donorName?.trim() || "—"} />
          {row.email?.trim() ? (
            <DetailRow label={NS.financial.email} value={row.email} />
          ) : null}
          {row.phone?.trim() ? (
            <DetailRow label={NS.financial.phone} value={row.phone} />
          ) : null}
          <DetailRow
            label={NS.financial.amount}
            value={formatAmount(row.amount, row.currency)}
          />
          <DetailRow
            label={NS.financial.paymentMethod}
            value={
              row.paymentMethod
                ? NS.paymentMethod[
                    row.paymentMethod as keyof typeof NS.paymentMethod
                  ] ?? row.paymentMethod
                : "—"
            }
          />
          {row.transactionReference?.trim() ? (
            <DetailRow
              label={NS.financial.transactionReference}
              value={row.transactionReference}
            />
          ) : null}
          {row.message?.trim() ? (
            <DetailRow
              label={NS.financial.message}
              value={<p className="whitespace-pre-wrap">{row.message}</p>}
            />
          ) : null}
          {row.createdAt ? (
            <DetailRow
              label={NS.financial.createdAt}
              value={formatFullTimestampKu(row.createdAt)}
            />
          ) : null}

          <div className="border-border space-y-2 border-t pt-4">
            <Label>{NS.financial.changeStatus}</Label>
            <Select
              value={statusDraft}
              onValueChange={(v) => setStatusDraft(v as DonationStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {NS.status[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter>
          <Button
            type="button"
            disabled={updateMut.isPending || statusDraft === currentStatus}
            onClick={handleSaveStatus}
          >
            {updateMut.isPending ? <Spinner className="me-2 size-4" /> : null}
            {NS.settings.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
