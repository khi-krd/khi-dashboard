"use client"

import { useState } from "react"

import { TX } from "@/components/taxonomy/taxonomy-strings"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import type { TaxonomyWritePayload } from "@/types/taxonomy"

/** Shared bilingual name editor — used for create and edit across all three taxonomy kinds. */
export function TaxonomyNameDialog({
  open,
  onOpenChange,
  title,
  initial,
  parentLabel,
  isPending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  initial?: { nameCkb: string; nameKmr: string } | null
  /** Read-only hint shown on sub-category writes ("parent: هەواڵ"). */
  parentLabel?: string | null
  isPending?: boolean
  onSubmit: (payload: TaxonomyWritePayload) => void
}) {
  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-lg" dir="rtl">
        <NameForm
          title={title}
          initial={initial}
          parentLabel={parentLabel}
          isPending={isPending}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

/** Remounts on every open, so useState seeds from `initial` without an effect. */
function NameForm({
  title,
  initial,
  parentLabel,
  isPending,
  onSubmit,
  onCancel,
}: {
  title: string
  initial?: { nameCkb: string; nameKmr: string } | null
  parentLabel?: string | null
  isPending?: boolean
  onSubmit: (payload: TaxonomyWritePayload) => void
  onCancel: () => void
}) {
  const [nameCkb, setNameCkb] = useState(initial?.nameCkb ?? "")
  const [nameKmr, setNameKmr] = useState(initial?.nameKmr ?? "")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      nameCkb: nameCkb.trim() || undefined,
      nameKmr: nameKmr.trim() || undefined,
    })
  }

  return (
    <form onSubmit={submit}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        {parentLabel ? (
          <div className="space-y-2">
            <Label className="text-muted-foreground">{TX.field.parent}</Label>
            <p className="text-foreground border-border/60 bg-muted/40 rounded-md border px-3 py-2 text-sm">
              {parentLabel}
            </p>
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="tx-name-ckb">{TX.field.nameCkb}</Label>
          <Input
            id="tx-name-ckb"
            value={nameCkb}
            onChange={(e) => setNameCkb(e.target.value)}
            placeholder={TX.field.nameCkb}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tx-name-kmr">{TX.field.nameKmr}</Label>
          <Input
            id="tx-name-kmr"
            dir="ltr"
            value={nameKmr}
            onChange={(e) => setNameKmr(e.target.value)}
            placeholder={TX.field.nameKmr}
          />
        </div>
      </div>
      <DialogFooter className="gap-2 sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          {TX.action.cancel}
        </Button>
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? <Spinner className="size-4" /> : null}
          {TX.action.save}
        </Button>
      </DialogFooter>
    </form>
  )
}
