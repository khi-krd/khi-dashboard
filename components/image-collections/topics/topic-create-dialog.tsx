"use client"

import { toast } from "sonner"

import { useSyncedState } from "@/hooks/use-synced-state"
import { NS } from "@/components/image-collections/collections-strings"
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
import {
  useCreateTopicMutation,
  useUpdateTopicMutation,
} from "@/hooks/useImageCollections"
import type { TopicDto } from "@/types/image-collections"

export function TopicCreateDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: TopicDto | null
}) {
  const editDeps = [open, editing]
  const [nameCkb, setNameCkb] = useSyncedState(
    editDeps,
    () => (open ? (editing?.nameCkb ?? "") : ""),
    () => "",
  )
  const [nameKmr, setNameKmr] = useSyncedState(
    editDeps,
    () => (open ? (editing?.nameKmr ?? "") : ""),
    () => "",
  )
  const createMut = useCreateTopicMutation()
  const updateMut = useUpdateTopicMutation()
  const isPending = createMut.isPending || updateMut.isPending

  function handleClose(next: boolean) {
    onOpenChange(next)
  }

  async function handleSubmit() {
    const ckb = nameCkb.trim()
    const kmr = nameKmr.trim()
    try {
      if (editing) {
        await updateMut.mutateAsync({
          topicId: editing.id,
          payload: { nameCkb: ckb, nameKmr: kmr },
        })
        toast.success(NS.toast.topic_updated)
      } else {
        await createMut.mutateAsync({
          nameCkb: ckb || undefined,
          nameKmr: kmr || undefined,
        })
        toast.success(NS.toast.topic_created)
      }
      handleClose(false)
    } catch {
      toast.error(NS.error.generic)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? NS.topic.edit_title : NS.action.new_topic}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{NS.topic.name_ckb}</Label>
            <Input value={nameCkb} onChange={(e) => setNameCkb(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{NS.topic.name_kmr}</Label>
            <Input
              dir="ltr"
              value={nameKmr}
              onChange={(e) => setNameKmr(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleClose(false)}
            disabled={isPending}
          >
            {NS.action.cancel}
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => void handleSubmit()}
          >
            {isPending ? <Spinner className="me-2 size-4" /> : null}
            {editing ? NS.action.save : NS.action.add}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
