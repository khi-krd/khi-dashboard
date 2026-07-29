"use client"

import type { MouseEvent } from "react"
import Image from "next/image"

import { isOptimizableImageSrc } from "@/lib/image-src"
import { NS } from "@/components/writings/writings-strings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { isPartOfMultiBookSeries } from "@/types/writings-ui"
import type { WritingDto } from "@/types/writings"
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

export function WritingDeleteDialog({
  open,
  onOpenChange,
  target,
  onConfirm,
  isPending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  target: (WritingDto & { titleCkb?: string | null }) | null
  onConfirm: () => void
  isPending?: boolean
}) {
  if (!target) return null

  const cover =
    target.ckbCoverUrl?.trim() ||
    target.kmrCoverUrl?.trim() ||
    null
  const writer = target.ckbContent?.writer?.trim() || NS.dash
  const inSeries = isPartOfMultiBookSeries(target)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default" className="border-border max-w-md rounded-lg border">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-start">
            {NS.dialog.delete.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3 text-start text-sm leading-relaxed">
            <p>{NS.dialog.delete.body}</p>
            {inSeries && target.seriesName ? (
              <p>{NS.dialog.delete.series_warning(target.seriesName)}</p>
            ) : null}
            <div className="border-border bg-card flex items-center gap-3 overflow-hidden rounded-md border p-2">
              <div className="bg-muted relative h-12 w-8 shrink-0 overflow-hidden rounded-md">
                {cover ? (
                  <Image
                    src={cover}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={!isOptimizableImageSrc(cover)}
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-medium">
                  {target.titleCkb ?? target.ckbContent?.title ?? NS.dash}
                </p>
                <p className="text-muted-foreground text-xs">{writer}</p>
                <p className="text-muted-foreground text-xs">
                  {formatCkbDigits(target.bookGenres?.length ?? 0)} جۆر
                </p>
              </div>
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
