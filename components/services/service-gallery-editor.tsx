"use client"

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { PencilIcon, PlayIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { ServiceGalleryBulkUploader } from "@/components/services/service-gallery-bulk-uploader"
import { ServiceGallerySlotDialog } from "@/components/services/service-gallery-slot-dialog"
import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { extractIframeSrc } from "@/lib/embed-url"
import {
  extractVimeoId,
  extractYoutubeId,
  vimeoPosterUrl,
  youtubeThumb,
} from "@/lib/video-url-helpers"
import { cn } from "@/lib/utils"
import { createEmptyGallerySlot } from "@/lib/validations/services"
import type { ServiceFormValues } from "@/lib/validations/services"
import { toastApiError } from "@/lib/toast"
import { patchServiceGalleryMedia } from "@/services/servicesService"
import { toast } from "sonner"

const MAX_GALLERY_SLOTS = 24

type GallerySlot = ServiceFormValues["galleryMedia"][number]

function providerPoster(url: string): string | null {
  const yt = youtubeThumb(url)
  if (yt) return yt
  const vm = extractVimeoId(url)
  return vm ? vimeoPosterUrl(vm) : null
}

function previewUrl(slot: GallerySlot | undefined): string | null {
  const url = slot?.url?.trim()
  if (!url) return null
  if (slot?.type === "VIDEO")
    return slot.posterUrl?.trim() || providerPoster(url) || null
  return url
}

export function ServiceGalleryEditor({ serviceId }: { serviceId?: number }) {
  const { control, watch } = useFormContext<ServiceFormValues>()
  const { fields, remove, move, append, update } = useFieldArray({
    control,
    name: "galleryMedia",
  })

  const slots = watch("galleryMedia") ?? []
  const [urlDraft, setUrlDraft] = useState("")
  const [urlType, setUrlType] = useState<"IMAGE" | "VIDEO">("IMAGE")
  const [posterDraft, setPosterDraft] = useState("")
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [patching, setPatching] = useState(false)

  const full = slots.length >= MAX_GALLERY_SLOTS

  /**
   * Persist the whole gallery list for an EXISTING service via the narrow
   * PATCH endpoint — a forgotten poster can be fixed without resubmitting
   * (and risking) the full record. Runs after the form-array write so the
   * two stay consistent.
   */
  async function patchGallery(nextSlots: GallerySlot[]) {
    if (!serviceId) return
    setPatching(true)
    try {
      await patchServiceGalleryMedia(
        serviceId,
        nextSlots
          .filter((s) => s.url?.trim())
          .map((s) => ({
            type: s.type ?? "IMAGE",
            url: extractIframeSrc(s.url!),
            posterUrl: s.posterUrl?.trim() || null,
            alt: s.alt?.trim() || null,
          })),
      )
      toast.success(NS.gallery.patchSaved)
    } catch (err) {
      toastApiError(err, NS.gallery.patchFailed)
    } finally {
      setPatching(false)
    }
  }

  function addUrlSlot() {
    // Accept a pasted <iframe …> embed too — only the src is stored.
    const url = extractIframeSrc(urlDraft)
    if (!url || full) return
    append({
      ...createEmptyGallerySlot(),
      type: urlType,
      url,
      posterUrl:
        urlType === "VIDEO"
          ? posterDraft.trim() || providerPoster(url) || ""
          : "",
    })
    setUrlDraft("")
    setPosterDraft("")
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    // The backend persists gallery order positionally (@OrderColumn
    // display_order), so moving the array is the whole job.
    move(oldIndex, newIndex)
  }

  return (
    <div className="space-y-3">
      <ServiceGalleryBulkUploader slotCount={slots.length} compact />

      {/* Add by URL — image or video link, with an optional video poster */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="border-border flex overflow-hidden rounded-md border">
          {(["IMAGE", "VIDEO"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setUrlType(t)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                urlType === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              {t === "VIDEO" ? NS.gallery.typeVideo : NS.gallery.typeImage}
            </button>
          ))}
        </div>
        <Input
          dir="ltr"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addUrlSlot()
            }
          }}
          placeholder={
            urlType === "VIDEO" ? "https://…video.mp4" : "https://…image.jpg"
          }
          className="min-w-[220px] flex-1 font-mono text-xs"
        />
        {urlType === "VIDEO" ? (
          <Input
            dir="ltr"
            value={posterDraft}
            onChange={(e) => setPosterDraft(e.target.value)}
            placeholder={`${NS.gallery.posterUrl} — https://…`}
            className="min-w-[180px] flex-1 font-mono text-xs"
          />
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!urlDraft.trim() || full}
          onClick={addUrlSlot}
        >
          {NS.gallery.addSlot}
        </Button>
      </div>
      {full ? (
        <p className="text-destructive text-xs">{NS.gallery.bulkMax("24")}</p>
      ) : null}

      {fields.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={rectSortingStrategy}
          >
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {fields.map((field, index) => (
                <SortableTile
                  key={field.id}
                  fieldId={field.id}
                  slot={slots[index]}
                  onEdit={() => setEditIndex(index)}
                  onRemove={() => remove(index)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : null}

      <ServiceGallerySlotDialog
        open={editIndex !== null}
        onOpenChange={(o) => !o && setEditIndex(null)}
        slot={editIndex !== null ? (slots[editIndex] ?? null) : null}
        saving={patching}
        onSave={(patch) => {
          if (editIndex === null) return
          const current = slots[editIndex]
          if (!current) return
          const next = { ...current, ...patch }
          update(editIndex, next)
          // Persist immediately when the service already exists — this is the
          // "forgot the thumbnail" patch path, no full PUT needed.
          if (serviceId) {
            void patchGallery(
              slots.map((s, i) => (i === editIndex ? next : s)),
            )
          }
        }}
        onDelete={() => {
          if (editIndex === null) return
          const next = slots.filter((_, i) => i !== editIndex)
          remove(editIndex)
          if (serviceId) void patchGallery(next)
        }}
      />
    </div>
  )
}

function SortableTile({
  fieldId,
  slot,
  onEdit,
  onRemove,
}: {
  fieldId: string
  slot: GallerySlot | undefined
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
  } = useSortable({ id: fieldId })

  const thumb = previewUrl(slot)
  const isVideo = slot?.type === "VIDEO"

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group border-border relative aspect-square cursor-grab touch-none overflow-hidden rounded-md border bg-muted/30 active:cursor-grabbing",
        isDragging && "z-10 shadow-lg ring-2 ring-primary/30",
      )}
      {...attributes}
      {...listeners}
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={slot?.alt ?? ""}
          className="size-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="text-muted-foreground flex size-full items-center justify-center text-xs">
          …
        </div>
      )}

      {isVideo ? (
        <span className="pointer-events-none absolute start-1.5 top-1.5 rounded bg-black/65 p-0.5 text-white">
          <PlayIcon className="size-3" />
        </span>
      ) : null}

      <button
        type="button"
        aria-label={NS.action.edit}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onEdit}
        className={cn(
          "absolute bottom-1.5 end-1.5 flex size-6 items-center justify-center rounded-full",
          "bg-black/65 text-white opacity-0 transition-opacity group-hover:opacity-100",
          "focus-visible:opacity-100 focus-visible:outline-none",
        )}
      >
        <PencilIcon className="size-3.5" />
      </button>

      <button
        type="button"
        aria-label={NS.action.delete}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className={cn(
          "absolute end-1.5 top-1.5 flex size-6 items-center justify-center rounded-full",
          "bg-black/65 text-white opacity-0 transition-opacity group-hover:opacity-100",
          "focus-visible:opacity-100 focus-visible:outline-none",
        )}
      >
        <XMarkIcon className="size-3.5" />
      </button>
    </li>
  )
}
