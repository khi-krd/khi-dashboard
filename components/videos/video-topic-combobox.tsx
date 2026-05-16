"use client"

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

import { NS } from "@/components/videos/videos-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useVideoTopicsQuery } from "@/hooks/useVideos"
import type { TopicDto } from "@/types/videos"

export function VideoTopicCombobox({
  topicId,
  newTopic,
  onSelectTopic,
  onClearTopic,
  onCreateInline,
}: {
  topicId: number | null
  newTopic?: { nameCkb?: string; nameKmr?: string }
  onSelectTopic: (t: TopicDto) => void
  onClearTopic: () => void
  onCreateInline: (names: { nameCkb: string; nameKmr: string }) => void
}) {
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [nameCkb, setNameCkb] = useState("")
  const [nameKmr, setNameKmr] = useState("")
  const topicsQ = useVideoTopicsQuery()
  const topics = topicsQ.data ?? []

  const selected = topics.find((t) => t.id === topicId)
  const pillLabel =
    newTopic?.nameCkb || newTopic?.nameKmr
      ? `+ ${newTopic.nameCkb || newTopic.nameKmr}`
      : selected?.nameCkb

  return (
    <div className="space-y-2">
      {pillLabel ? (
        <span className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
          {pillLabel}
          <button type="button" onClick={onClearTopic} aria-label={NS.action.cancel}>
            <XMarkIcon className="size-3.5" />
          </button>
        </span>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" size="sm" className="w-full justify-start">
              {topicId || newTopic ? NS.section.topic : NS.filter.all_topics}
            </Button>
          }
        />
        <PopoverContent className="w-72 p-2" align="start">
          <ul className="max-h-48 space-y-1 overflow-y-auto">
            {topics.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="hover:bg-muted w-full rounded-md px-2 py-1.5 text-start text-sm"
                  onClick={() => {
                    onSelectTopic(t)
                    setOpen(false)
                  }}
                >
                  <span className="block font-medium">{t.nameCkb}</span>
                  {t.nameKmr ? (
                    <span className="text-muted-foreground block text-xs">
                      {t.nameKmr}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
          {showCreate ? (
            <div className="border-border mt-2 space-y-2 border-t pt-2">
              <Input
                placeholder={NS.topic.name_ckb}
                value={nameCkb}
                onChange={(e) => setNameCkb(e.target.value)}
              />
              <Input
                placeholder={NS.topic.name_kmr}
                value={nameKmr}
                onChange={(e) => setNameKmr(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                className="w-full"
                onClick={() => {
                  onCreateInline({ nameCkb, nameKmr })
                  setShowCreate(false)
                  setOpen(false)
                  setNameCkb("")
                  setNameKmr("")
                }}
              >
                {NS.action.add}
              </Button>
            </div>
          ) : (
            <button
              type="button"
              className="text-primary mt-2 flex w-full items-center gap-1 px-2 py-1.5 text-xs"
              onClick={() => setShowCreate(true)}
            >
              <PlusIcon className="size-4" />
              {NS.topic.add}
            </button>
          )}
        </PopoverContent>
      </Popover>
      <p className="text-muted-foreground text-xs">{NS.field.topic_helper}</p>
    </div>
  )
}
