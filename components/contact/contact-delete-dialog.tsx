"use client"

import { ContactStatusPill } from "@/components/contact/contact-status-pill"
import { NS, truncateTitle } from "@/components/contact/contact-strings"
import type { ContactDto } from "@/types/contact"
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
import { contactDisplayTitle } from "@/lib/contact-normalize"

export function ContactDeleteDialog({
  open,
  onOpenChange,
  target,
  onConfirm,
  isPending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  target: ContactDto | null
  onConfirm: () => void
  isPending?: boolean
}) {
  if (!target) return null
  const title = contactDisplayTitle(target) || `#${target.id}`

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="default"
        className="border-border max-w-md rounded-lg border"
      >
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-start">
            {NS.delete.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3 text-start text-sm leading-relaxed">
            <p>{NS.delete.description(truncateTitle(title, 64))}</p>
            <div className="border-border flex items-center gap-3 overflow-hidden rounded-md border bg-card p-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{title}</p>
                <ContactStatusPill active={target.active} className="mt-1" />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-start">
          <AlertDialogCancel disabled={isPending}>
            {NS.delete.cancel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? <Spinner className="size-4" /> : NS.delete.confirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
