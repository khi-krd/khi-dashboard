"use client"

import { useState } from "react"
import { toast } from "sonner"

import { NS } from "@/components/sounds/sounds-strings"
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
import { useCreateTopicMutation } from "@/hooks/useSounds"

export function TopicCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [nameCkb, setNameCkb] = useState("")
  const [nameKmr, setNameKmr] = useState("")
  const createMut = useCreateTopicMutation()

  function reset() {
    setNameCkb("")
    setNameKmr("")
  }

  function handleClose(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nameCkb.trim() && !nameKmr.trim()) {
      toast.error(NS.validation.topicNameRequired)
      return
    }
    try {
      await createMut.mutateAsync({
        nameCkb: nameCkb.trim() || undefined,
        nameKmr: nameKmr.trim() || undefined,
      })
      toast.success(NS.toast.topic_created)
      handleClose(false)
    } catch {
      toast.error(NS.error.generic)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-lg" dir="rtl">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{NS.action.new_topic}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sound-topic-name-ckb">{NS.topic.name_ckb}</Label>
              <Input
                id="sound-topic-name-ckb"
                value={nameCkb}
                onChange={(e) => setNameCkb(e.target.value)}
                placeholder={NS.topic.name_ckb}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sound-topic-name-kmr">{NS.topic.name_kmr}</Label>
              <Input
                id="sound-topic-name-kmr"
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
              disabled={createMut.isPending}
            >
              {NS.action.cancel}
            </Button>
            <Button type="submit" disabled={createMut.isPending} className="gap-2">
              {createMut.isPending ? <Spinner className="size-4" /> : null}
              {NS.action.add}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
