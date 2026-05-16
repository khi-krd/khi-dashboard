"use client"

import type { MouseEvent } from "react"
import Image from "next/image"

import { NS, truncateTitle } from "@/components/news/news-strings"
import type { NewsDto } from "@/types/news"
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
    Pick<NewsDto, "id" | "coverUrl"> & { titleCkb?: string | null }
  >
}

type SingleTarget = {
  mode: "single"
  item: Pick<NewsDto, "id" | "coverUrl"> & { titleCkb?: string | null }
}

type Target = BulkTarget | SingleTarget

function BulkRecap({
  items,
}: {
  items: BulkTarget["items"]
}) {
  const head = items.slice(0, 3)
  const rest = items.length - head.length
  return (
    <ul className="text-foreground mt-2 list-none space-y-1.5 text-start text-sm font-medium">
      {head.map((it) => (
        <li key={String(it.id)} className="flex items-start gap-2">
          <span aria-hidden className="text-muted-foreground">
            ·
          </span>
          <span className="truncate">{truncateTitle(it.titleCkb ?? "", 160)}</span>
        </li>
      ))}
      {rest > 0 ? (
        <li className="text-muted-foreground text-xs">
          و {formatCkbDigits(rest)} ی تر…
        </li>
      ) : null}
    </ul>
  )
}

export function NewsDeleteDialog({
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
  const cover = isBulk ? target.items[0]?.coverUrl : target.item.coverUrl
  const titleCkb = isBulk
    ? target.items[0]?.titleCkb
    : target.item.titleCkb

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default" className="max-w-md rounded-lg border border-border">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-start">
            {NS.dialog.delete.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-2 text-start text-sm leading-relaxed">
            <p className="text-pretty">
              {isBulk
                ? NS.dialog.bulk_delete.body(
                    formatCkbDigits(target.items.length),
                  )
                : NS.dialog.delete.body}
            </p>
            {isBulk ? <BulkRecap items={target.items} /> : null}
            <div className="border-border text-foreground flex items-center gap-2 overflow-hidden rounded-md border bg-card p-2">
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
              <p className="truncate text-sm font-medium">
                {truncateTitle(titleCkb ?? "", 120)}
              </p>
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
