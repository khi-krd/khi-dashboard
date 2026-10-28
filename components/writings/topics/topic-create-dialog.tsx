"use client"

import { toast } from "sonner"

import { useSyncedState } from "@/hooks/use-synced-state"
import { NS } from "@/components/writings/writings-strings"
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
} from "@/hooks/useWritings"
import type { TopicDto } from "@/types/writings"
import { toastApiError } from "@/lib/toast"

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
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
    } catch (err) {
      toastApiError(err, NS.error.generic)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-lg" dir="rtl">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editing ? NS.topic.edit_title : NS.action.new_topic}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="writing-topic-name-ckb">{NS.topic.name_ckb}</Label>
              <Input
                id="writing-topic-name-ckb"
                value={nameCkb}
                onChange={(e) => setNameCkb(e.target.value)}
                placeholder={NS.topic.name_ckb}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="writing-topic-name-kmr">{NS.topic.name_kmr}</Label>
              <Input
                id="writing-topic-name-kmr"
                dir="ltr"
                value={nameKmr}
                onChange={(e) => setNameKmr(e.target.value)}
                placeholder={NS.topic.name_kmr}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isPending}
            >
              {NS.action.cancel}
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? <Spinner className="size-4" /> : null}
              {editing ? NS.action.save : NS.action.add}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
