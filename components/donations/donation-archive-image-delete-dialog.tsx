"use client"

import type { MouseEvent } from "react"

import {
  DAI,
  donationArchiveImageTitle,
  truncateLabel,
} from "@/components/donations/donation-archive-images-strings"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { DonationArchiveVideoDto } from "@/types/donation-archive-video"

export function DonationArchiveImageDeleteDialog({
  open,
  onOpenChange,
  target,
  onConfirm,
  isPending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  target: DonationArchiveVideoDto | null
  onConfirm: () => void
  isPending?: boolean
}) {
  if (!target) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="default"
        className="max-w-md rounded-lg border border-border"
      >
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-start">
            {DAI.dialog.deleteTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-start text-sm leading-relaxed text-muted-foreground">
            <span className="block">{DAI.dialog.deleteBody}</span>
            <span className="flex items-center gap-3 overflow-hidden rounded-md border border-border bg-card p-2">
              {target.videoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={target.videoUrl}
                  alt=""
                  className="size-10 shrink-0 rounded object-cover"
                />
              ) : (
                <span className="size-10 shrink-0 rounded bg-muted" />
              )}
              <span className="min-w-0 flex-1 space-y-1">
                <span className="block truncate text-sm font-medium">
                  {donationArchiveImageTitle(target)}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {truncateLabel(
                    target.descriptionCkb ?? target.descriptionKmr ?? "",
                    120
                  ) || DAI.dash}
                </span>
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel className="rounded-md">
            {DAI.action.cancel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            className="rounded-md"
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault()
              onConfirm()
            }}
          >
            {isPending ? <Spinner className="me-2 size-4" aria-hidden /> : null}
            {DAI.action.delete}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
