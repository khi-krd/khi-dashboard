"use client"

import type { MouseEvent } from "react"

import { NS } from "@/components/writings/writings-strings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { TopicDto } from "@/types/writings"
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

export function TopicDeleteDialog({
  open,
  onOpenChange,
  target,
  writingCount,
  onConfirm,
  isPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: TopicDto | null
  writingCount: number
  onConfirm: () => void
  isPending?: boolean
}) {
  if (!target) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default" className="max-w-md rounded-lg border border-border">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-start">
            {NS.topics.delete.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3 text-start text-sm leading-relaxed">
            <p>{NS.topics.delete.body(formatCkbDigits(writingCount))}</p>
            <div className="border-border rounded-md border bg-card p-3">
              <p className="font-medium">{target.nameCkb || NS.dash}</p>
              {target.nameKmr ? (
                <p className="text-muted-foreground text-xs">{target.nameKmr}</p>
              ) : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel className="rounded-md">
            {NS.action.cancel}
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
            {NS.action.delete}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
