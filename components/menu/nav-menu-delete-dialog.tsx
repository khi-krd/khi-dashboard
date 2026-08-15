"use client"

import type { MouseEvent } from "react"

import { NM, truncateLabel } from "@/components/menu/nav-menu-strings"
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
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { NavMenuItemDto } from "@/types/nav-menu"

export function NavMenuDeleteDialog({
  open,
  onOpenChange,
  target,
  onConfirm,
  isPending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  target: NavMenuItemDto | null
  onConfirm: () => void
  isPending?: boolean
}) {
  if (!target) return null

  const linkCount = target.links?.length ?? 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="default"
        className="border-border max-w-md rounded-lg border"
      >
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-start">
            {NM.dialog.deleteTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3 text-start text-sm leading-relaxed">
            <span className="block">{NM.dialog.deleteBody}</span>
            <span className="border-border bg-card flex items-center gap-3 overflow-hidden rounded-md border p-2">
              <span className="min-w-0 flex-1 space-y-1">
                <span className="block truncate text-sm font-medium">
                  {truncateLabel(target.labelCkb, 120) || NM.dash}
                </span>
                <span
                  className="text-muted-foreground block truncate font-mono text-xs"
                  dir="ltr"
                >
                  {target.itemKey}
                  {linkCount > 0
                    ? ` · ${NM.links.count(formatCkbDigits(linkCount))}`
                    : ""}
                </span>
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel className="rounded-md">
            {NM.action.cancel}
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
            {NM.action.delete}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
