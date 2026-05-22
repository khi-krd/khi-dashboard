"use client"

import { useEffect, useState } from "react"

import { CollectionItemSourcePanel } from "@/components/image-collections/collection-item-source-panel"
import { TiptapEditor } from "@/components/shared/tiptap-editor"
import { NS } from "@/components/image-collections/collections-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { ImageItemFormValues } from "@/lib/validations/image-collections"

export function AlbumItemSheet({
  open,
  onOpenChange,
  index,
  item,
  onSave,
  onDelete,
  showKmrFields = true,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  index: number
  item: ImageItemFormValues | null
  onSave: (item: ImageItemFormValues) => void
  onDelete: () => void
  showKmrFields?: boolean
}) {
  const [draft, setDraft] = useState<ImageItemFormValues | null>(item)

  useEffect(() => {
    if (item) setDraft({ ...item })
  }, [item, open])

  if (!draft) return null

  function patch(p: Partial<ImageItemFormValues>) {
    setDraft((d) => (d ? { ...d, ...p } : d))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-[520px]">
        <SheetHeader>
          <SheetTitle>{NS.item.sheet_title(formatCkbDigits(index + 1))}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          <CollectionItemSourcePanel item={draft} onChange={patch} />

          <div className="space-y-2">
            <Label className="text-xs">{NS.lang.ckb} — نووسە</Label>
            <Input
              value={draft.captionCkb ?? ""}
              onChange={(e) => patch({ captionCkb: e.target.value })}
              placeholder={NS.field.caption_placeholder.ckb}
            />
          </div>

          {showKmrFields ? (
            <div className="space-y-2">
              <Label className="text-xs">{NS.lang.kmr} — şîrove</Label>
              <Input
                dir="ltr"
                value={draft.captionKmr ?? ""}
                onChange={(e) => patch({ captionKmr: e.target.value })}
                placeholder={NS.field.caption_placeholder.kmr}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label className="text-xs">{NS.lang.ckb} — وەسف</Label>
            <TiptapEditor
              lang="CKB"
              contentMinHeightClass="min-h-[160px]"
              value={draft.descriptionCkb ?? ""}
              onChange={(v) => patch({ descriptionCkb: v })}
              placeholder={NS.field.description_placeholder.ckb}
            />
          </div>

          {showKmrFields ? (
            <div className="space-y-2">
              <Label className="text-xs">{NS.lang.kmr} — vekolîn</Label>
              <TiptapEditor
                lang="KMR"
                contentMinHeightClass="min-h-[160px]"
                value={draft.descriptionKmr ?? ""}
                onChange={(v) => patch({ descriptionKmr: v })}
                placeholder={NS.field.description_placeholder.kmr}
              />
            </div>
          ) : null}

          {draft.widthPx != null ? (
            <p className="text-muted-foreground font-mono text-xs">
              {NS.meta.dimensions}: {draft.widthPx}×{draft.heightPx} · {draft.humanReadableSize}
            </p>
          ) : null}
        </div>
        <SheetFooter className="flex-row gap-2 border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            {NS.item.delete}
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() => {
              onSave(draft)
              onOpenChange(false)
            }}
          >
            {NS.action.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
