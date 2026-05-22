"use client"

import { useEffect, useState } from "react"
import { InformationCircleIcon } from "@heroicons/react/24/outline"

import { ServiceMediaTypeBadge } from "@/components/services/service-media-type-badge"
import { TiptapEditor } from "@/components/shared/tiptap-editor"
import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type {
  ServiceCollectionFileDto,
  ServiceMediaType,
} from "@/types/services"

type ContentDraft = { caption: string; title: string; description: string }

function initDraft(file: ServiceCollectionFileDto): {
  ckb: ContentDraft
  kmr: ContentDraft
} {
  return {
    ckb: {
      caption: file.ckbContent?.caption ?? "",
      title: file.ckbContent?.title ?? "",
      description: file.ckbContent?.description ?? "",
    },
    kmr: {
      caption: file.kmrContent?.caption ?? "",
      title: file.kmrContent?.title ?? "",
      description: file.kmrContent?.description ?? "",
    },
  }
}

export function ServiceFileSheet({
  open,
  onOpenChange,
  file,
  mediaType,
  collectionName,
  onSave,
  onDelete,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  file: ServiceCollectionFileDto | null
  mediaType: ServiceMediaType
  collectionName: string
  onSave: (updated: ServiceCollectionFileDto) => void
  onDelete: () => void
}) {
  const [tab, setTab] = useState<"CKB" | "KMR">("CKB")
  const [ckb, setCkb] = useState({ caption: "", title: "", description: "" })
  const [kmr, setKmr] = useState({ caption: "", title: "", description: "" })

  useEffect(() => {
    if (file) {
      const d = initDraft(file)
      setCkb(d.ckb)
      setKmr(d.kmr)
      setTab("CKB")
    }
  }, [file])

  if (!file) return null

  const active = tab === "CKB" ? ckb : kmr
  const setActive = tab === "CKB" ? setCkb : setKmr

  const metaRows: { label: string; value: string | null | undefined }[] = [
    { label: NS.file.metadataFormat, value: file.fileFormat },
    { label: NS.file.metadataResolution, value: file.resolution },
    { label: NS.file.metadataDuration, value: file.formattedDuration },
    { label: NS.file.metadataCodec, value: file.codec },
    {
      label: NS.file.metadataBitrate,
      value: file.bitrateKbps != null ? `${file.bitrateKbps} kbps` : null,
    },
    { label: NS.file.metadataSize, value: file.formattedFileSize },
  ].filter((r) => r.value)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-[480px]" dir="rtl">
        <SheetHeader>
          <SheetTitle>{NS.file.sheetTitle}</SheetTitle>
          <p className="text-muted-foreground flex items-center gap-2 text-xs">
            {collectionName}
            <ServiceMediaTypeBadge type={mediaType} />
          </p>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
          <div className="bg-muted overflow-hidden rounded-lg">
            {mediaType === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file.fileUrl}
                alt=""
                className="aspect-video w-full object-contain"
              />
            ) : mediaType === "VIDEO" ? (
              <video
                src={file.fileUrl}
                controls
                poster={file.thumbnailUrl ?? undefined}
                className="aspect-video w-full"
              />
            ) : (
              <audio src={file.fileUrl} controls className="w-full p-4" />
            )}
          </div>

          <div className="border-border flex gap-2 border-b">
            {(["CKB", "KMR"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                className={cn(
                  "border-b-2 pb-2 text-sm",
                  tab === lang
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground",
                )}
                onClick={() => setTab(lang)}
              >
                {lang === "CKB" ? NS.lang.ckb : NS.lang.kmr}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs">
                {NS.file.caption}
              </label>
              <Input
                value={active.caption ?? ""}
                onChange={(e) =>
                  setActive((p) => ({ ...p, caption: e.target.value }))
                }
                placeholder={NS.file.captionPlaceholder}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs">
                {NS.file.title}
              </label>
              <Input
                value={active.title ?? ""}
                onChange={(e) =>
                  setActive((p) => ({ ...p, title: e.target.value }))
                }
                placeholder={NS.file.titlePlaceholder}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs">
                {NS.file.description}
              </label>
              <TiptapEditor
                toolbar="compact"
                lang={tab}
                contentMinHeightClass="min-h-[160px]"
                placeholder={
                  tab === "CKB" ? NS.field.bodyCkb : NS.field.bodyKmr
                }
                value={active.description ?? ""}
                onChange={(html) =>
                  setActive((p) => ({ ...p, description: html }))
                }
              />
            </div>
          </div>

          {metaRows.length > 0 ? (
            <section>
              <h4 className="text-muted-foreground mb-2 flex items-center gap-1 text-xs uppercase tracking-wide">
                {NS.file.metadataTitle}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <InformationCircleIcon className="text-muted-foreground size-3.5" />
                    }
                  />
                  <TooltipContent>{NS.file.metadataAutoTooltip}</TooltipContent>
                </Tooltip>
              </h4>
              <dl className="space-y-1.5 text-xs">
                {metaRows.map((row) => (
                  <div key={row.label} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="font-mono">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>

        <SheetFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button type="button" variant="ghost" className="text-destructive" onClick={onDelete}>
            {NS.file.delete}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {NS.action.cancel}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onSave({
                  ...file,
                  ckbContent: ckb,
                  kmrContent: kmr,
                })
                onOpenChange(false)
              }}
            >
              {NS.action.save}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
