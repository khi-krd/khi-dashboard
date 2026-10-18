"use client"

import type { MouseEvent } from "react"

import { TX } from "@/components/taxonomy/taxonomy-strings"
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

export function TaxonomyDeleteDialog({
  open,
  onOpenChange,
  title,
  nameCkb,
  nameKmr,
  body,
  isPending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  nameCkb: string
  nameKmr?: string
  body: string
  isPending?: boolean
  onConfirm: () => void
}) {
  if (!open) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="default"
        className="max-w-md rounded-lg border border-border"
      >
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-start">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3 text-start text-sm leading-relaxed">
            <p>{body}</p>
            <div className="border-border bg-card rounded-md border p-3">
              <p className="text-foreground font-medium">
                {nameCkb || TX.dash}
              </p>
              {nameKmr ? (
                <p className="text-muted-foreground text-xs">{nameKmr}</p>
              ) : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel className="rounded-md">
            {TX.action.cancel}
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
            {TX.action.delete}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
