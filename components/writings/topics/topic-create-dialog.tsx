"use client"

import { useState } from "react"
import { toast } from "sonner"

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
import { useCreateTopicMutation } from "@/hooks/useWritings"

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

  async function handleSubmit() {
    if (!nameCkb.trim() && !nameKmr.trim()) return
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
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>{NS.action.new_topic}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{NS.topic.name_ckb}</Label>
            <Input value={nameCkb} onChange={(e) => setNameCkb(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{NS.topic.name_kmr}</Label>
            <Input value={nameKmr} onChange={(e) => setNameKmr(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
            {NS.action.cancel}
          </Button>
          <Button
            type="button"
            disabled={createMut.isPending}
            onClick={() => void handleSubmit()}
          >
            {createMut.isPending ? <Spinner className="me-2 size-4" /> : null}
            {NS.action.add}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
