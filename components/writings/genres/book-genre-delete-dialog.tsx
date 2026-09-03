"use client"

import type { MouseEvent } from "react"

import { BG } from "@/components/writings/genres/book-genres-strings"
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
import { bookGenreLabel, type BookGenreDto } from "@/types/book-genre"

export function BookGenreDeleteDialog({
  open,
  onOpenChange,
  target,
  /** Undefined when neither the API nor the loaded book list could tell us. */
  bookCount,
  onConfirm,
  isPending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  target: BookGenreDto | null
  bookCount?: number
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
            {BG.dialog.deleteTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3 text-start text-sm leading-relaxed">
            {/* Saying "0 books" when the count is merely unknown would be a
                promise the dashboard cannot keep, so the vaguer sentence is
                used until a count is actually available. */}
            <span className="block">
              {bookCount == null
                ? BG.dialog.deleteBodyUnknown
                : BG.dialog.deleteBody(
                    BG.field.bookCount(formatCkbDigits(bookCount)),
                  )}
            </span>
            <span className="border-border bg-card block rounded-md border p-3">
              <span className="block text-sm font-medium">
                {bookGenreLabel(target)}
              </span>
              <span
                className="text-muted-foreground block font-mono text-xs"
                dir="ltr"
              >
                {target.slug}
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel className="rounded-md">
            {BG.action.cancel}
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
            {BG.action.delete}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
