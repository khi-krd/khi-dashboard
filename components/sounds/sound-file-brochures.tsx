"use client"

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import { useEffect, useState } from "react"

import { useObjectUrl } from "@/hooks/use-object-url"
import { NS } from "@/components/sounds/sounds-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFileUpload } from "@/hooks/use-file-upload"
import type { BrochureFormValues } from "@/lib/validations/sounds"

function newBrochureKey() {
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function SoundFileBrochures({
  brochures,
  onChange,
}: {
  brochures: BrochureFormValues[]
  onChange: (next: BrochureFormValues[]) => void
}) {
  function patchAt(i: number, patch: Partial<BrochureFormValues>) {
    const next = brochures.map((b, idx) => (idx === i ? { ...b, ...patch } : b))
    onChange(next)
  }

  function removeAt(i: number) {
    onChange(brochures.filter((_, idx) => idx !== i))
  }

  function addBrochure() {
    onChange([
      ...brochures,
      {
        clientKey: newBrochureKey(),
        imageUrl: "",
        caption: "",
        brochureOrder: brochures.length,
        stagedImageFile: null,
      },
    ])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {NS.section.brochures}
        </h3>
        <Button type="button" size="sm" variant="outline" onClick={addBrochure}>
          <PlusIcon className="size-4" />
          {NS.action.new_brochure}
        </Button>
      </div>
      {brochures.length === 0 ? (
        <p className="text-muted-foreground text-xs">{NS.brochure.empty}</p>
      ) : (
        <ul className="space-y-3">
          {brochures.map((b, i) => (
            <BrochureRow
              key={b.clientKey}
              brochure={b}
              onPatch={(p) => patchAt(i, p)}
              onRemove={() => removeAt(i)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function BrochureRow({
  brochure,
  onPatch,
  onRemove,
}: {
  brochure: BrochureFormValues
  onPatch: (p: Partial<BrochureFormValues>) => void
  onRemove: () => void
}) {
  const blob = useObjectUrl(brochure.stagedImageFile)


  const preview = blob || brochure.imageUrl?.trim() || null

  const [, { getInputProps, openFileDialog, removeFile }] = useFileUpload({
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    accept: "image/jpeg,image/png,image/webp",
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      onPatch({ stagedImageFile: entry.file, imageUrl: "" })
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  return (
    <li className="border-border flex gap-3 rounded-lg border p-3">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-md border">
        <input {...getInputProps()} className="sr-only" />
        {preview ? (
          <Image src={preview} alt="" fill className="object-cover" unoptimized />
        ) : (
          <button
            type="button"
            className="text-muted-foreground size-full text-[10px]"
            onClick={openFileDialog}
          >
            {NS.action.add}
          </button>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <Input
          value={brochure.caption ?? ""}
          onChange={(e) => onPatch({ caption: e.target.value })}
          placeholder={NS.field.brochure_caption_placeholder}
          className="h-8 text-xs"
        />
        <Input
          value={brochure.imageUrl ?? ""}
          onChange={(e) => onPatch({ imageUrl: e.target.value, stagedImageFile: null })}
          placeholder="https://"
          className="h-8 text-xs"
        />
      </div>
      <button type="button" className="text-muted-foreground hover:text-destructive shrink-0" onClick={onRemove}>
        <TrashIcon className="size-4" />
      </button>
    </li>
  )
}
