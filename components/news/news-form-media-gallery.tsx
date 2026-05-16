"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react"
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ArrowUpTrayIcon,
  Bars2Icon,
  CloudArrowUpIcon,
  DocumentIcon,
  PencilSquareIcon,
  PlayCircleIcon,
  PlusIcon,
  SpeakerWaveIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { Controller, type FieldErrors, useFormContext } from "react-hook-form"

import { NS } from "@/components/news/news-strings"
import { Badge } from "@/components/reui/badge"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { NewsFormValues } from "@/lib/validations/news"
import { cn } from "@/lib/utils"
import type { NewsMediaType } from "@/types/news"

const MEDIA_TYPES = [
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "DOCUMENT",
  "OTHER",
] as const satisfies readonly NewsMediaType[]

function guessMediaTypeFromFile(f: File): NewsMediaType {
  if (f.type.startsWith("image/")) return "IMAGE"
  if (f.type.startsWith("video/")) return "VIDEO"
  if (f.type.startsWith("audio/")) return "AUDIO"
  return "DOCUMENT"
}

function useTransientObjectUrl(file: File | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!file) {
      setUrl(null)
      return
    }
    const next = URL.createObjectURL(file)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [file])
  return url
}

function mediaTypeTriggerLabel(value: NewsMediaType | null | undefined) {
  if (!value) return ""
  return NS.mediaType[value]
}

export type GalleryFieldLike = {
  id: string
}

export function NewsFormMediaGallery<Field extends GalleryFieldLike>(props: {
  fields: Field[]
  append: (v: NewsFormValues["mediaItems"][number]) => void
  remove: (i: number) => void
  move: (from: number, to: number) => void
  errors?: FieldErrors<NewsFormValues>["mediaItems"]
}) {
  const { fields, append, remove, move } = props
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<NewsFormValues>()
  const mediaErrors = props.errors ?? errors.mediaItems

  const fileGalleryRef = useRef<HTMLInputElement>(null)
  const sheetFileReplaceRef = useRef<HTMLInputElement>(null)
  const [sheetIdx, setSheetIdx] = useState<number | null>(null)

  const [linkOpen, setLinkOpen] = useState(false)
  const [linkType, setLinkType] = useState<NewsMediaType>("VIDEO")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkExternalUrl, setLinkExternalUrl] = useState("")
  const [linkEmbedUrl, setLinkEmbedUrl] = useState("")

  useEffect(() => {
    if (sheetIdx === null) return
    if (sheetIdx >= fields.length) setSheetIdx(null)
  }, [fields.length, sheetIdx])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const items = fields.map((f) => f.id)

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    const oldIdx = fields.findIndex((f) => f.id === e.active.id)
    const newIdx = fields.findIndex((f) => f.id === e.over!.id)
    if (oldIdx < 0 || newIdx < 0 || oldIdx === newIdx) return
    move(oldIdx, newIdx)
  }

  const ingestFilesList = useCallback(
    (list: FileList | File[]) => {
      for (const file of Array.from(list)) {
        append({
          type: guessMediaTypeFromFile(file),
          url: null,
          externalUrl: null,
          embedUrl: null,
          stagedFile: file,
        })
      }
    },
    [append],
  )

  function onGalDragOver(ev: SyntheticEvent) {
    ev.preventDefault()
    const de = ev as unknown as DragEvent
    if (de.dataTransfer) de.dataTransfer.dropEffect = "copy"
  }

  function onGalDrop(ev: SyntheticEvent) {
    ev.preventDefault()
    const de = ev as unknown as DragEvent
    const fs = de.dataTransfer?.files
    if (fs?.length) ingestFilesList(fs)
  }

  function appendFromLinkPopover() {
    append({
      type: linkType,
      url: linkUrl.trim() || null,
      externalUrl: linkExternalUrl.trim() || null,
      embedUrl: linkEmbedUrl.trim() || null,
      stagedFile: null,
    })
    setLinkExternalUrl("")
    setLinkEmbedUrl("")
    setLinkUrl("")
    setLinkOpen(false)
  }

  return (
    <div dir="rtl" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            {NS.section.media}
          </h2>
          <Badge variant="primary-light" className="tabular-nums text-xs font-semibold">
            {formatCkbDigits(fields.length)}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <PopoverTrigger
              nativeButton={false}
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 rounded-md text-xs"
                >
                  {NS.action.add_media_link}
                </Button>
              }
            />
            <PopoverContent
              dir="rtl"
              align="end"
              sideOffset={6}
              className="flex w-[min(100vw-2rem,22rem)] flex-col gap-2.5"
            >
              <div className="space-y-1.5">
                <Label className="text-xs">{NS.field.media_type}</Label>
                <Select
                  value={linkType}
                  onValueChange={(v) => setLinkType(v as NewsMediaType)}
                >
                  <SelectTrigger className="h-9 w-full rounded-md">
                    <SelectValue>
                      {(v: NewsMediaType | null | undefined) =>
                        mediaTypeTriggerLabel(v ?? linkType)
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {MEDIA_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {NS.mediaType[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(linkType === "IMAGE" || linkType === "DOCUMENT") && (
                <div className="space-y-1.5">
                  <Label className="text-xs">{NS.field.media_direct_url}</Label>
                  <Input
                    dir="ltr"
                    className="h-9 font-mono text-xs"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>
              )}
              {linkType === "VIDEO" ||
              linkType === "AUDIO" ||
              linkType === "OTHER" ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{NS.field.external_url}</Label>
                    <Input
                      dir="ltr"
                      className="h-9 font-mono text-xs"
                      value={linkExternalUrl}
                      onChange={(e) => setLinkExternalUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{NS.field.embed_url}</Label>
                    <Input
                      dir="ltr"
                      className="h-9 font-mono text-xs"
                      value={linkEmbedUrl}
                      onChange={(e) => setLinkEmbedUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{NS.field.media_direct_url}</Label>
                    <Input
                      dir="ltr"
                      className="h-9 font-mono text-xs"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                  </div>
                </>
              ) : null}
              <Button
                type="button"
                size="sm"
                className="w-full rounded-md"
                onClick={appendFromLinkPopover}
              >
                {NS.action.add_inline}
              </Button>
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-9 gap-1.5 rounded-md text-xs"
            onClick={() => fileGalleryRef.current?.click()}
          >
            <ArrowUpTrayIcon className="size-4 rtl:rotate-180" aria-hidden />
            {NS.action.upload_media_file}
          </Button>
        </div>
      </div>

      <input
        ref={fileGalleryRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,application/pdf"
        onChange={(ev) => {
          const fs = ev.target.files
          if (fs?.length) ingestFilesList(fs)
          ev.target.value = ""
        }}
      />

      <div
        role="presentation"
        onDragOver={onGalDragOver}
        onDrop={onGalDrop}
        className={cn(
          fields.length === 0
            ? "border-muted-foreground/35 bg-muted/10 rounded-lg border border-dashed px-6 py-12 text-center transition-colors hover:border-primary/35 hover:bg-muted/20"
            : "space-y-3",
        )}
      >
        {fields.length === 0 ? (
          <button
            type="button"
            className="mx-auto flex w-full max-w-md flex-col items-center gap-4 text-muted-foreground outline-none transition hover:text-foreground"
            onClick={() => fileGalleryRef.current?.click()}
          >
            <CloudArrowUpIcon className="size-14 opacity-60" aria-hidden />
            <p className="text-sm leading-relaxed">{NS.field.media_drag_empty}</p>
          </button>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            sensors={sensors}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={items} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => fileGalleryRef.current?.click()}
                  className="border-muted-foreground/40 text-muted-foreground hover:border-primary/50 hover:bg-muted/30 hover:text-foreground flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 transition-colors"
                  aria-label={NS.action.add_media_row}
                >
                  <PlusIcon className="size-10 opacity-60" aria-hidden />
                  <span className="text-center text-[0.7rem] leading-tight font-medium">
                    {NS.action.add_media_row}
                  </span>
                </button>

                {fields.map((row, idx) => (
                  <SortableNewsMediaTile
                    key={row.id}
                    id={row.id}
                    idx={idx}
                    hasError={
                      !!(mediaErrors?.[idx]?.url || mediaErrors?.[idx]?.externalUrl)
                    }
                    watch={watch}
                    onEdit={() => setSheetIdx(idx)}
                    onRemove={() => remove(idx)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {sheetIdx !== null ? (
        <Sheet open onOpenChange={(o) => !o && setSheetIdx(null)}>
          <SheetContent
            key={sheetIdx ?? "closed"}
            dir="rtl"
            side="left"
            className="w-full gap-0 p-0 sm:max-w-md"
          >
            <SheetHeader className="border-border border-b p-4">
              <SheetTitle>{NS.action.edit_media_item}</SheetTitle>
            </SheetHeader>
            <div className="scrollbar-thin flex max-h-[calc(100vh-8rem)] flex-col gap-4 overflow-y-auto p-4 pb-28">
              <div className="space-y-1.5">
                <Label>{NS.field.media_type}</Label>
                <Controller
                  name={`mediaItems.${sheetIdx}.type`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as NewsMediaType)}
                    >
                      <SelectTrigger className="h-10 w-full rounded-md">
                        <SelectValue>
                          {(v: NewsMediaType | null | undefined) =>
                            v != null ? NS.mediaType[v] : ""
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        {MEDIA_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {NS.mediaType[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label>{NS.field.media_direct_url}</Label>
                <Input
                  dir="ltr"
                  className="h-10 rounded-md font-mono text-xs"
                  {...register(`mediaItems.${sheetIdx}.url`)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{NS.field.external_url}</Label>
                <Input
                  dir="ltr"
                  className="h-10 rounded-md font-mono text-xs"
                  {...register(`mediaItems.${sheetIdx}.externalUrl`)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{NS.field.embed_url}</Label>
                <Input
                  dir="ltr"
                  className="h-10 rounded-md font-mono text-xs"
                  {...register(`mediaItems.${sheetIdx}.embedUrl`)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>{NS.field.media_file}</Label>
                <input
                  ref={sheetFileReplaceRef}
                  type="file"
                  className="hidden"
                  onChange={(ev) => {
                    const f = ev.target.files?.[0]
                    setValue(`mediaItems.${sheetIdx}.stagedFile`, f ?? null, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                    ev.target.value = ""
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md"
                  size="sm"
                  onClick={() => sheetFileReplaceRef.current?.click()}
                >
                  {NS.action.replace_media_file}
                </Button>
              </div>

              {(() => {
                const row = mediaErrors?.[sheetIdx]
                const msg =
                  typeof row?.url?.message === "string"
                    ? row.url.message
                    : typeof row?.externalUrl?.message === "string"
                      ? row.externalUrl.message
                      : undefined
                return msg ? <FieldError className="text-xs">{msg}</FieldError> : null
              })()}
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  )
}

function SortableNewsMediaTile({
  id,
  idx,
  watch,
  onEdit,
  onRemove,
  hasError,
}: {
  id: string
  idx: number
  hasError: boolean
  watch: (name: keyof NewsFormValues | string) => unknown
  onEdit: () => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const item = watch(`mediaItems.${idx}`) as NewsFormValues["mediaItems"][number]
  const type = item?.type ?? "IMAGE"
  const staged = item?.stagedFile ?? null
  const direct = typeof item?.url === "string" ? item.url.trim() : ""
  const external =
    typeof item?.externalUrl === "string" ? item.externalUrl.trim() : ""

  const blob = useTransientObjectUrl(staged as File | null | undefined)

  const previewImg =
    type === "IMAGE"
      ? blob || direct || external || null
      : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group border-border relative aspect-square overflow-hidden rounded-lg border",
        isDragging && "ring-primary/40 z-40 opacity-95 shadow-lg ring-2",
      )}
    >
      {type === "IMAGE" ? (
        previewImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewImg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2 text-[0.7rem]">
            <ArrowUpTrayIcon className="size-10 opacity-50" aria-hidden />
            <span>{NS.mediaType.IMAGE}</span>
          </div>
        )
      ) : type === "VIDEO" ? (
        staged && blob ? (
          <video
            src={blob}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-900 text-white">
            <PlayCircleIcon className="mx-auto size-12 opacity-90" aria-hidden />
            <span className="absolute bottom-2 start-2 rounded bg-black/55 px-1.5 py-0.5 text-[0.65rem] text-white/95">
              {NS.mediaType.VIDEO}
            </span>
          </div>
        )
      ) : type === "AUDIO" ? (
        <div className="bg-muted text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2">
          <SpeakerWaveIcon className="size-12 opacity-60" aria-hidden />
          <span className="text-[0.65rem] font-medium">{NS.mediaType.AUDIO}</span>
        </div>
      ) : type === "DOCUMENT" ? (
        <div className="bg-muted text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2">
          <DocumentIcon className="size-12 opacity-60" aria-hidden />
          <span className="text-[0.65rem] font-medium">{NS.mediaType.DOCUMENT}</span>
        </div>
      ) : (
        <div className="bg-muted text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2">
          <DocumentIcon className="size-10 opacity-45" aria-hidden />
          <span className="text-[0.65rem]">{NS.mediaType.OTHER}</span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <div className="bg-background/60 absolute inset-0 backdrop-blur-[1px]" />
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            className="pointer-events-auto rounded-full shadow-md"
            onClick={onEdit}
            aria-label={NS.action.edit_media_item}
          >
            <PencilSquareIcon className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            className="pointer-events-auto rounded-full text-destructive shadow-md hover:text-destructive"
            aria-label={NS.action.delete}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <TrashIcon className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <button
        type="button"
        {...attributes}
        {...listeners}
        className="bg-background/85 absolute start-1.5 top-1.5 z-[2] rounded-md p-1.5 opacity-0 shadow-sm ring-1 ring-black/10 transition-opacity hover:bg-background group-hover:opacity-100"
        aria-label={NS.action.reorder_media}
      >
        <Bars2Icon className="text-muted-foreground size-5" aria-hidden />
      </button>

      {hasError ? (
        <span
          className="bg-destructive absolute end-2 top-2 z-[3] inline-flex size-2.5 rounded-full shadow"
          aria-hidden
        />
      ) : null}
    </div>
  )
}
