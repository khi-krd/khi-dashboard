"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { NS } from "@/components/writings/writings-strings"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  useLinkToSeriesMutation,
  useSeriesParentsQuery,
  useWritingsListQuery,
} from "@/hooks/useWritings"
import type { WritingDto } from "@/types/writings"

export type SeriesLinkMode = "fromBook" | "fromSeries"

export function WritingSeriesLinkDialog({
  open,
  onOpenChange,
  mode,
  writing,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  mode: SeriesLinkMode
  writing: WritingDto
  onSuccess?: () => void
}) {
  const linkMut = useLinkToSeriesMutation()
  const parentsQ = useSeriesParentsQuery()
  const listQ = useWritingsListQuery({
    page: 0,
    size: 200,
    keyword: "",
    searchMode: "writer",
    topicId: null,
    languageFilter: "all",
  })

  const [parentBookId, setParentBookId] = useState<number | null>(null)
  const [childBookId, setChildBookId] = useState<number | null>(null)
  const [seriesOrder, setSeriesOrder] = useState(1)

  useEffect(() => {
    if (!open) return
    setParentBookId(null)
    setChildBookId(null)
    setSeriesOrder((writing.seriesOrder ?? 0) + 1)
  }, [open, writing.seriesOrder])

  const parents = parentsQ.data ?? []
  const books = (listQ.data?.content ?? []).filter((b) => b.id !== writing.id)

  async function handleConfirm() {
    if (!writing.id) return

    const payload =
      mode === "fromBook"
        ? {
            bookId: writing.id,
            parentBookId: parentBookId!,
            seriesOrder,
            seriesName: writing.seriesName ?? undefined,
          }
        : {
            bookId: childBookId!,
            parentBookId: writing.id,
            seriesOrder,
            seriesName: writing.seriesName ?? undefined,
          }

    if (mode === "fromBook" && !parentBookId) return
    if (mode === "fromSeries" && !childBookId) return

    try {
      await linkMut.mutateAsync(payload)
      toast.success(NS.toast.linked_to_series)
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error(NS.error.generic)
    }
  }

  const pending = linkMut.isPending
  const canSubmit =
    mode === "fromBook" ? parentBookId != null : childBookId != null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{NS.series.dialog.title}</DialogTitle>
          <DialogDescription className="text-start text-sm">
            {writing.ckbContent?.title?.trim() || NS.dash}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {mode === "fromBook" ? (
            <div className="space-y-1">
              <Label className="text-xs">{NS.series.dialog.series_picker}</Label>
              <Select
                value={parentBookId != null ? String(parentBookId) : ""}
                onValueChange={(v) => setParentBookId(v ? Number(v) : null)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={NS.series.dialog.series_picker} />
                </SelectTrigger>
                <SelectContent dir="rtl" className="max-h-64">
                  {parents.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.ckbContent?.title?.trim() || `#${p.id}`}
                      {p.seriesName ? ` (${p.seriesName})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1">
              <Label className="text-xs">{NS.series.dialog.book_picker}</Label>
              <Select
                value={childBookId != null ? String(childBookId) : ""}
                onValueChange={(v) => setChildBookId(v ? Number(v) : null)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={NS.series.dialog.book_picker} />
                </SelectTrigger>
                <SelectContent dir="rtl" className="max-h-64">
                  {books.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.ckbContent?.title?.trim() || `#${b.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs">{NS.field.series_order}</Label>
            <Input
              type="number"
              min={1}
              className="h-9"
              value={seriesOrder}
              onChange={(e) =>
                setSeriesOrder(Math.max(1, Number(e.target.value) || 1))
              }
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {NS.action.cancel}
          </Button>
          <Button
            type="button"
            disabled={!canSubmit || pending}
            onClick={() => void handleConfirm()}
          >
            {pending ? <Spinner className="me-2 size-4" /> : null}
            {NS.series.dialog.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
