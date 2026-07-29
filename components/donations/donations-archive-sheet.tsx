"use client"

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { useSyncedState } from "@/hooks/use-synced-state"
import { DonationStatusPill } from "@/components/donations/donation-status-pill"
import { DonationStatusSelect } from "@/components/donations/donation-status-select"
import { NS } from "@/components/donations/donations-strings"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { useUpdateArchiveDonationStatusMutation } from "@/hooks/useDonations"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { formatFullTimestampKu } from "@/lib/news-relative-time"
import { toastError } from "@/lib/toast"
import { ARCHIVE_MATERIAL_LABELS } from "@/types/donations-ui"
import type { ArchiveDonationRow } from "@/types/donations-ui"
import type { DonationStatus } from "@/types/donations"

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="text-sm">{value}</div>
    </div>
  )
}

export function DonationsArchiveSheet({
  open,
  onOpenChange,
  row,
  onStatusUpdated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: ArchiveDonationRow | null
  onStatusUpdated?: () => void
}) {
  const updateMut = useUpdateArchiveDonationStatusMutation()
  const [statusDraft, setStatusDraft] = useSyncedState(
    [row],
    () => (row ? (row.status ?? "PENDING") : undefined),
    () => (row?.status ?? "PENDING") as DonationStatus,
  )

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
          <SheetTitle>{NS.archive.sheetTitle(formatCkbDigits(row.id))}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
          <div className="flex items-center gap-2">
            <DonationStatusPill status={currentStatus} />
          </div>

          <DetailRow label={NS.archive.donorName} value={row.donorName?.trim() || "—"} />
          <DetailRow label={NS.archive.phone} value={row.phone?.trim() || "—"} />
          {row.email?.trim() ? (
            <DetailRow label={NS.archive.email} value={row.email} />
          ) : null}
          <DetailRow
            label={NS.archive.materialType}
            value={
              row.materialType ? ARCHIVE_MATERIAL_LABELS[row.materialType] : "—"
            }
          />
          {row.title?.trim() ? (
            <DetailRow label={NS.archive.registerName} value={row.title} />
          ) : null}
          {row.description?.trim() ? (
            <DetailRow
              label={NS.archive.description}
              value={<p className="whitespace-pre-wrap">{row.description}</p>}
            />
          ) : null}
          {row.estimatedDate?.trim() ? (
            <DetailRow label={NS.archive.estimatedDate} value={row.estimatedDate} />
          ) : null}
          {row.attachmentUrl?.trim() ? (
            <DetailRow
              label={NS.archive.attachment}
              value={
                <Link
                  href={row.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
                >
                  {NS.action.openAttachment}
                  <ArrowTopRightOnSquareIcon className="size-3.5" />
                </Link>
              }
            />
          ) : null}
          {row.createdAt ? (
            <DetailRow
              label={NS.archive.createdAt}
              value={formatFullTimestampKu(row.createdAt)}
            />
          ) : null}

          <div className="border-border space-y-2 border-t pt-4">
            <Label>{NS.archive.changeStatus}</Label>
            <DonationStatusSelect
              value={statusDraft}
              onValueChange={setStatusDraft}
            />
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
