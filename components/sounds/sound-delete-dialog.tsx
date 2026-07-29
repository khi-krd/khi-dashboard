"use client"

import type { MouseEvent } from "react"
import Image from "next/image"

import { isOptimizableImageSrc } from "@/lib/image-src"
import { SoundStatePill } from "@/components/sounds/sound-state-pill"
import { NS, truncateTitle } from "@/components/sounds/sounds-strings"
import { formatDuration } from "@/lib/sound-format"
import type { SoundDto } from "@/types/sounds"
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

export function SoundDeleteDialog({
  open,
  onOpenChange,
  target,
  onConfirm,
  isPending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  target: Pick<
    SoundDto,
    "id" | "trackState" | "ckbCoverUrl" | "files"
  > & { titleCkb?: string | null } | null
  onConfirm: () => void
  isPending?: boolean
}) {
  if (!target) return null

  const cover = target.ckbCoverUrl?.trim()
  const totalDuration = (target.files ?? []).reduce(
    (acc, f) => acc + (f.durationSeconds ?? 0),
    0,
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default" className="max-w-md rounded-lg border border-border">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-start">
            {NS.dialog.delete.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3 text-start text-sm leading-relaxed">
            <p>{NS.dialog.delete.body}</p>
            <div className="border-border flex items-center gap-3 overflow-hidden rounded-md border bg-card p-2">
              <div className="bg-muted relative size-12 shrink-0 overflow-hidden rounded-md">
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
                  {truncateTitle(target.titleCkb ?? "", 120)}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <SoundStatePill
                    trackState={target.trackState}
                    className="w-auto"
                  />
                  <span className="text-muted-foreground font-mono text-xs">
                    {formatDuration(totalDuration)}
                  </span>
                </div>
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
