"use client"

import { useCallback, useRef, useState } from "react"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  LinkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useFieldArray, useFormContext } from "react-hook-form"

import { ServiceFileInlineEditor } from "@/components/services/service-file-inline-editor"
import { ServiceFileSheet } from "@/components/services/service-file-sheet"
import { ServiceMediaTypeBadge } from "@/components/services/service-media-type-badge"
import { NS } from "@/components/services/services-strings"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUploadServiceFilesMutation } from "@/hooks/useServices"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { ServiceFormValues } from "@/lib/validations/services"
import type { ServiceCollectionFileDto, ServiceMediaType } from "@/types/services"

function acceptForType(type: ServiceMediaType): string {
  if (type === "IMAGE") return "image/*"
  if (type === "VIDEO") return "video/*"
  return "audio/*"
}

export function ServiceCollectionSection({
  collectionIndex,
  onRemoveCollection,
}: {
  collectionIndex: number
  onRemoveCollection: () => void
}) {
  const { watch, setValue, control } = useFormContext<ServiceFormValues>()
  const collection = watch(`mediaCollections.${collectionIndex}`)
  const [collapsed, setCollapsed] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [sheetFileIndex, setSheetFileIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMut = useUploadServiceFilesMutation()

  const { fields, append, remove } = useFieldArray({
    control,
    name: `mediaCollections.${collectionIndex}.files`,
  })

  const handleFilesSelected = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length) return
      const files = Array.from(fileList)
      const startIdx = fields.length
      files.forEach((_, i) => {
        append({
          fileUrl: "",
          uploadPending: true,
          sortOrder: startIdx + i,
        } as ServiceFormValues["mediaCollections"][0]["files"][0])
      })
      try {
        const res = await uploadMut.mutateAsync(files)
        const uploaded = res.data ?? []
        uploaded.forEach((u, i) => {
          const idx = startIdx + i
          setValue(`mediaCollections.${collectionIndex}.files.${idx}`, {
            fileUrl: u.fileUrl,
            thumbnailUrl: u.thumbnailUrl ?? "",
            fileFormat: u.fileFormat,
            widthPx: u.widthPx,
            heightPx: u.heightPx,
            resolution: u.resolution,
            durationSeconds: u.durationSeconds,
            formattedDuration: u.formattedDuration,
            codec: u.codec,
            bitrateKbps: u.bitrateKbps,
            fileSize: u.fileSize,
            formattedFileSize: u.formattedFileSize,
            sortOrder: idx,
            ckbContent: {},
            kmrContent: {},
            uploadPending: false,
          })
        })
      } catch {
        for (let i = 0; i < files.length; i++) {
          setValue(
            `mediaCollections.${collectionIndex}.files.${startIdx + i}.uploadError`,
            NS.upload.failed,
          )
          setValue(
            `mediaCollections.${collectionIndex}.files.${startIdx + i}.uploadPending`,
            false,
          )
        }
      }
    },
    [append, collectionIndex, fields.length, setValue, uploadMut],
  )

  const addFileByUrl = () => {
    append({
      fileUrl: "",
      thumbnailUrl: "",
      sortOrder: fields.length,
      ckbContent: {},
      kmrContent: {},
    } as ServiceFormValues["mediaCollections"][0]["files"][0])
  }

  const sheetFile =
    sheetFileIndex != null
      ? watch(`mediaCollections.${collectionIndex}.files.${sheetFileIndex}`)
      : null

  return (
    <div className="border-border/60 space-y-4 border-t pt-6 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <Input
            className="h-9 border-0 bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0"
            value={collection.collectionName}
            onChange={(e) =>
              setValue(
                `mediaCollections.${collectionIndex}.collectionName`,
                e.target.value,
                { shouldDirty: true },
              )
            }
            placeholder={NS.collection.namePlaceholder}
          />
        </div>
        <ServiceMediaTypeBadge type={collection.mediaType} />
        <span className="text-muted-foreground text-xs">
          {NS.collection.fileCount(formatCkbDigits(fields.length))}
        </span>
        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground text-xs whitespace-nowrap">
            {NS.collection.sortOrderLabel}
          </Label>
          <Input
            type="number"
            className="h-8 w-16 font-mono text-xs"
            dir="ltr"
            value={collection.sortOrder ?? collectionIndex}
            onChange={(e) =>
              setValue(
                `mediaCollections.${collectionIndex}.sortOrder`,
                Number(e.target.value) || 0,
                { shouldDirty: true },
              )
            }
          />
        </div>
        <div className="ms-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? (
              <ChevronDownIcon className="size-4" />
            ) : (
              <ChevronUpIcon className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
      </div>

      {!collapsed ? (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMut.isPending}
            >
              {NS.action.upload_files}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={addFileByUrl}
            >
              <LinkIcon className="size-4" />
              {NS.action.add_file_by_url}
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-muted-foreground text-sm">{NS.collection.emptyFiles}</p>
          ) : (
            <div className="space-y-0">
              {fields.map((field, fileIndex) => (
                <ServiceFileInlineEditor
                  key={field.id}
                  collectionIndex={collectionIndex}
                  fileIndex={fileIndex}
                  mediaType={collection.mediaType}
                  onRemove={() => remove(fileIndex)}
                  onOpenSheet={() => setSheetFileIndex(fileIndex)}
                />
              ))}
            </div>
          )}
        </>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept={acceptForType(collection.mediaType)}
        multiple
        onChange={(e) => {
          void handleFilesSelected(e.target.files)
          e.target.value = ""
        }}
      />

      <ServiceFileSheet
        open={sheetFileIndex != null}
        onOpenChange={(open) => {
          if (!open) setSheetFileIndex(null)
        }}
        file={sheetFile as ServiceCollectionFileDto}
        mediaType={collection.mediaType}
        collectionName={collection.collectionName}
        onSave={(updated) => {
          if (sheetFileIndex == null) return
          setValue(
            `mediaCollections.${collectionIndex}.files.${sheetFileIndex}`,
            updated as ServiceFormValues["mediaCollections"][0]["files"][0],
            { shouldDirty: true },
          )
        }}
        onDelete={() => {
          if (sheetFileIndex != null) remove(sheetFileIndex)
          setSheetFileIndex(null)
        }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>{NS.collection.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {NS.collection.deleteBody(formatCkbDigits(fields.length))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{NS.action.cancel}</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onRemoveCollection()
                setDeleteOpen(false)
              }}
            >
              {NS.action.delete}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
