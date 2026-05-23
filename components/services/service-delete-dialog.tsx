"use client"

import type { MouseEvent } from "react"

import { ServiceStatusPill } from "@/components/services/service-status-pill"
import { NS, truncateTitle } from "@/components/services/services-strings"
import type { ServiceDto } from "@/types/services"
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
type BulkTarget = {
  mode: "bulk"
  items: Array<
    Pick<ServiceDto, "id" | "active" | "publishedAt"> & {
      titleCkb?: string | null
    }
  >
}

type SingleTarget = {
  mode: "single"
  item: Pick<ServiceDto, "id" | "active" | "publishedAt"> & {
    titleCkb?: string | null
  }
}

type Target = BulkTarget | SingleTarget

export function ServiceDeleteDialog({
  open,
  onOpenChange,
  target,
  onConfirm,
  isPending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  target: Target | null
  onConfirm: () => void
  isPending?: boolean
}) {
  if (!target) return null

  const isBulk = target.mode === "bulk"
  const first = isBulk ? target.items[0] : target.item
  const titleCkb = first?.titleCkb

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="default"
        className="border-border max-w-md rounded-lg border"
      >
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-start">
            {NS.dialog.deleteTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3 text-start text-sm leading-relaxed">
            <p>
              {isBulk
                ? NS.dialog.bulkDeleteBody(
                    formatCkbDigits(target.items.length),
                  )
                : NS.dialog.deleteBody}
            </p>
            {!isBulk && first ? (
              <div className="border-border bg-card flex items-center gap-3 overflow-hidden rounded-md border p-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-medium">
                    {truncateTitle(titleCkb ?? "", 120)}
                  </p>
                  <ServiceStatusPill service={first} />
                </div>
              </div>
            ) : isBulk ? (
              <ul className="text-foreground mt-2 list-none space-y-1.5 text-start text-sm font-medium">
                {target.items.slice(0, 3).map((it) => (
                  <li key={String(it.id)} className="flex items-start gap-2">
                    <span aria-hidden className="text-muted-foreground">
                      ·
                    </span>
                    <span className="truncate">
                      {truncateTitle(it.titleCkb ?? "", 160)}
                    </span>
                  </li>
                ))}
                {target.items.length > 3 ? (
                  <li className="text-muted-foreground text-xs">
                    و {formatCkbDigits(target.items.length - 3)} ی تر…
                  </li>
                ) : null}
              </ul>
            ) : null}
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
            {isPending ? (
              <Spinner className="me-2 size-4" aria-hidden />
            ) : null}
            {NS.action.delete}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function serviceToDeleteTarget(
  row: ServiceDto & { titleCkb?: string },
): SingleTarget["item"] {
  return {
    id: row.id,
    active: row.active,
    publishedAt: row.publishedAt,
    titleCkb: row.titleCkb,
  }
}
