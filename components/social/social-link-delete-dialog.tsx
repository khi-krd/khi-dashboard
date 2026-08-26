"use client"

import type { MouseEvent } from "react"

import { SocialPlatformIcon } from "@/components/social/social-platform-icon"
import {
  SL,
  platformLabel,
  truncateLabel,
} from "@/components/social/social-links-strings"
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
import type { SocialLinkDto } from "@/types/social-links"

export function SocialLinkDeleteDialog({
  open,
  onOpenChange,
  target,
  onConfirm,
  isPending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  target: SocialLinkDto | null
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
            {SL.dialog.deleteTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3 text-start text-sm leading-relaxed">
            <span className="block">{SL.dialog.deleteBody}</span>
            <span className="border-border bg-card flex items-center gap-3 overflow-hidden rounded-md border p-2">
              <SocialPlatformIcon
                platform={target.platform}
                className="text-muted-foreground shrink-0"
              />
              <span className="min-w-0 flex-1 space-y-1">
                <span className="block truncate text-sm font-medium">
                  {platformLabel(target.platform) || SL.dash}
                </span>
                <span
                  className="text-muted-foreground block truncate font-mono text-xs"
                  dir="ltr"
                >
                  {truncateLabel(target.url, 120) || SL.dash}
                </span>
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel className="rounded-md">
            {SL.action.cancel}
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
            {SL.action.delete}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
