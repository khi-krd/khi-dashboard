"use client"

import type { MouseEvent } from "react"

import {
  DTC,
  donationTypeCardTitle,
  truncateLabel,
} from "@/components/donations/donation-type-cards-strings"
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
import type { DonationTypeCardDto } from "@/types/donation-type-card"

export function DonationTypeCardDeleteDialog({
  open,
  onOpenChange,
  target,
  onConfirm,
  isPending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  target: DonationTypeCardDto | null
  onConfirm: () => void
  isPending?: boolean
}) {
  if (!target) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="default"
        className="border-border max-w-md rounded-lg border"
      >
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-start">
            {DTC.dialog.deleteTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3 text-start text-sm leading-relaxed">
            <span className="block">{DTC.dialog.deleteBody}</span>
            <span className="border-border bg-card flex items-center gap-3 overflow-hidden rounded-md border p-2">
              {target.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={target.imageUrl}
                  alt=""
                  className="size-10 shrink-0 rounded object-cover"
                />
              ) : (
                <span className="bg-muted size-10 shrink-0 rounded" />
              )}
              <span className="min-w-0 flex-1 space-y-1">
                <span className="block truncate text-sm font-medium">
                  {donationTypeCardTitle(target)}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {truncateLabel(
                    target.descriptionCkb ?? target.descriptionKmr ?? "",
                    120,
                  ) || DTC.dash}
                </span>
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel className="rounded-md">
            {DTC.action.cancel}
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
            {DTC.action.delete}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
