"use client"

import Image from "next/image"

import { AboutStatusPill } from "@/components/about/about-status-pill"
import { NS, truncateTitle } from "@/components/about/about-strings"
import type { AboutDto } from "@/types/about"
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

export function AboutDeleteDialog({
  open,
  onOpenChange,
  target,
  onConfirm,
  isPending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  target: Pick<AboutDto, "id" | "status" | "heroImageUrl" | "titleCkb"> | null
  onConfirm: () => void
  isPending?: boolean
}) {
  if (!target) return null
  const title = target.titleCkb?.trim() || `#${target.id}`
  const hero = target.heroImageUrl?.trim()

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
              <div className="bg-muted relative aspect-[3/2] h-12 shrink-0 overflow-hidden rounded-md">
                {hero ? (
                  <Image src={hero} alt="" fill className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{title}</p>
                <AboutStatusPill status={target.status} className="mt-1" />
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
