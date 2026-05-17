"use client"

import type { MouseEvent } from "react"
import Image from "next/image"

import { CollectionTypePill } from "@/components/image-collections/collection-type-pill"
import { NS } from "@/components/image-collections/collections-strings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { CollectionDto } from "@/types/image-collections"
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

export function CollectionDeleteDialog({
  open,
  onOpenChange,
  target,
  onConfirm,
  isPending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  target: Pick<
    CollectionDto,
    "id" | "collectionType" | "ckbCoverUrl" | "imageAlbum"
  > & { titleCkb?: string | null } | null
  onConfirm: () => void
  isPending?: boolean
}) {
  if (!target) return null

  const cover = target.ckbCoverUrl?.trim()
  const count = target.imageAlbum?.length ?? 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default" className="border-border max-w-md rounded-lg border">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-start">
            {NS.dialog.delete.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3 text-start text-sm leading-relaxed">
            <p>{NS.dialog.delete.body}</p>
            <div className="border-border bg-card flex items-center gap-3 overflow-hidden rounded-md border p-2">
              <div className="bg-muted relative size-12 shrink-0 overflow-hidden rounded-md">
                {cover ? (
                  <Image
                    src={cover}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={cover.startsWith("http")}
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-medium">
                  {target.titleCkb?.trim() || NS.dash}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <CollectionTypePill collectionType={target.collectionType} compact />
                  <span className="text-muted-foreground text-xs">
                    {formatCkbDigits(count)} وێنە
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
