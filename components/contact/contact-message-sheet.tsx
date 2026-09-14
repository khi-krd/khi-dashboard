"use client"

import Link from "next/link"
import { toast } from "sonner"

import { useSyncedState } from "@/hooks/use-synced-state"
import { DonationStatusPill } from "@/components/donations/donation-status-pill"
import { DonationStatusSelect } from "@/components/donations/donation-status-select"
import { NS } from "@/components/contact/contact-strings"
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
import { useUpdateContactMessageStatusMutation } from "@/hooks/useContact"
import { extractApiErrorMessage } from "@/lib/api-error"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { formatFullTimestampKu } from "@/lib/news-relative-time"
import { toastError } from "@/lib/toast"
import type { ContactMessageDto } from "@/types/contact"
import { isDonationStatus, type DonationStatus } from "@/types/donations"

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="text-sm">{value}</div>
    </div>
  )
}

function resolveStatus(status?: string | null): DonationStatus {
  const upper = status?.trim().toUpperCase()
  return upper && isDonationStatus(upper) ? upper : "NEW"
}

export function ContactMessageSheet({
  open,
  onOpenChange,
  row,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: ContactMessageDto | null
}) {
  const updateMut = useUpdateContactMessageStatusMutation()
  const [statusDraft, setStatusDraft] = useSyncedState(
    [row],
    () => (row ? (resolveStatus(row.status) as DonationStatus) : undefined),
    () => "NEW" as DonationStatus,
  )

  if (!row) return null

  const currentStatus = resolveStatus(row.status)

  function handleSaveStatus() {
    if (!row?.id) return
    updateMut.mutate(
      { id: row.id, status: statusDraft },
      {
        onSuccess: () => {
          toast.success(NS.toast.statusUpdated)
          onOpenChange(false)
        },
        onError: (err) =>
          toastError(extractApiErrorMessage(err) ?? NS.error.validation),
      },
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>
            {NS.messages.sheetTitle(formatCkbDigits(row.id ?? 0))}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
          <div className="flex items-center gap-2">
            <DonationStatusPill status={currentStatus} />
            {row.locale?.trim() ? (
              <span className="bg-muted text-muted-foreground inline-flex rounded px-1.5 py-0.5 font-mono text-[10px] uppercase">
                {row.locale}
              </span>
            ) : null}
          </div>

          <DetailRow label={NS.messages.sender} value={row.name?.trim() || "—"} />
          <DetailRow
            label={NS.detail.email}
            value={
              row.email?.trim() ? (
                <Link
                  href={`mailto:${row.email}`}
                  className="text-primary font-mono text-sm hover:underline"
                  dir="ltr"
                >
                  {row.email}
                </Link>
              ) : (
                "—"
              )
            }
          />
          {row.phone?.trim() ? (
            <DetailRow
              label={NS.detail.phone}
              value={
                <Link
                  href={`tel:${row.phone}`}
                  className="font-mono text-sm"
                  dir="ltr"
                >
                  {row.phone}
                </Link>
              }
            />
          ) : null}
          <DetailRow
            label={NS.messages.subject}
            value={row.subject?.trim() || "—"}
          />
          {row.message?.trim() ? (
            <DetailRow
              label={NS.messages.message}
              value={
                <p className="whitespace-pre-wrap leading-relaxed">
                  {row.message}
                </p>
              }
            />
          ) : null}
          {row.createdAt ? (
            <DetailRow
              label={NS.messages.sentAt}
              value={formatFullTimestampKu(row.createdAt)}
            />
          ) : null}

          <div className="border-border/60 bg-card/50 space-y-2 rounded-xl border p-4 shadow-xs">
            <Label>{NS.messages.changeStatus}</Label>
            <DonationStatusSelect
              value={statusDraft}
              onValueChange={setStatusDraft}
            />
          </div>

          <p className="text-muted-foreground text-[11px] leading-relaxed">
            {NS.messages.replyHint}
          </p>
        </div>

        <SheetFooter>
          <Button
            type="button"
            disabled={
              updateMut.isPending ||
              !row.id ||
              statusDraft === currentStatus
            }
            onClick={handleSaveStatus}
          >
            {updateMut.isPending ? <Spinner className="me-2 size-4" /> : null}
            {NS.action.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
