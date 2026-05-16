"use client"

import {
  DocumentIcon,
  PhotoIcon,
  PlayIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import * as React from "react"

import { NS } from "@/components/news/news-strings"
import {
  extractYoutubeId,
  youtubeThumb,
} from "@/components/news/news-media-helpers"
import type { MediaDto } from "@/types/news"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

function MediaTileInner({
  media,
  interactive,
  onActivate,
}: {
  media: Pick<MediaDto, "type" | "url" | "externalUrl" | "embedUrl">
  interactive: boolean
  onActivate: () => void
}) {
  const yt = youtubeThumb(
    media.externalUrl ?? media.embedUrl ?? media.url ?? "",
  )
  if (media.type === "IMAGE") {
    const src = media.url ?? ""
    return (
      <button
        type="button"
        disabled={!interactive}
        onClick={interactive ? onActivate : undefined}
        className={cn(
          "bg-muted relative aspect-square w-full overflow-hidden rounded-md",
          interactive && "cursor-pointer",
        )}
      >
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 45vw, 200px"
            unoptimized={src.startsWith("http")}
          />
        ) : (
          <PhotoIcon className="text-muted-foreground/50 m-auto size-12" />
        )}
      </button>
    )
  }

  if (media.type === "VIDEO") {
    return (
      <button
        type="button"
        disabled={!interactive}
        onClick={interactive ? onActivate : undefined}
        className={cn(
          "border-border bg-muted relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border",
          interactive && "cursor-pointer",
        )}
      >
        {yt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={yt} alt="" className="absolute inset-0 size-full object-cover" />
        ) : null}
        <PlayIcon className="text-primary relative z-[1] size-12 rtl:rotate-180" />
        <span className="text-muted-foreground absolute bottom-2 start-2 z-[2] rounded-md bg-background/80 px-1.5 py-0.5 text-[0.6875rem] font-medium backdrop-blur-sm">
          {NS.media.video}
        </span>
      </button>
    )
  }

  if (media.type === "AUDIO") {
    return (
      <button
        type="button"
        disabled={!interactive}
        onClick={interactive ? onActivate : undefined}
        className={cn(
          "border-border bg-muted/60 relative flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed",
          interactive && "cursor-pointer",
        )}
      >
        <SpeakerWaveIcon className="text-muted-foreground size-12" />
        <span className="text-muted-foreground text-xs">{NS.media.audio}</span>
        <div aria-hidden className="flex h-24 items-end justify-center gap-1 pb-2">
          <div className="bg-muted-foreground/50 h-8 w-4 rounded-[2px]" />
          <div className="bg-muted-foreground/50 h-16 w-4 rounded-[2px]" />
          <div className="bg-muted-foreground/50 h-24 w-4 rounded-[2px]" />
          <div className="bg-muted-foreground/50 h-12 w-4 rounded-[2px]" />
          <div className="bg-muted-foreground/50 h-16 w-4 rounded-[2px]" />
          <div className="bg-muted-foreground/50 h-12 w-4 rounded-[2px]" />
        </div>
      </button>
    )
  }

  if (media.type === "DOCUMENT") {
    return (
      <button
        type="button"
        disabled={!interactive}
        onClick={interactive ? onActivate : undefined}
        className={cn(
          "border-border bg-muted/40 flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-md border",
          interactive && "cursor-pointer",
        )}
      >
        <DocumentIcon className="text-muted-foreground size-12" />
        <span className="text-muted-foreground text-xs">
          {NS.media.document}
        </span>
      </button>
    )
  }

  return (
    <div className="bg-muted flex aspect-square items-center justify-center rounded-md">
      <PhotoIcon className="text-muted-foreground size-16 opacity-60" />
    </div>
  )
}

function VideoLightbox({ media }: { media: MediaDto }) {
  const ytId = extractYoutubeId(
    media.embedUrl ?? media.externalUrl ?? media.url ?? "",
  )
  const direct = media.url ?? media.externalUrl ?? ""
  if (ytId) {
    const src = `https://www.youtube.com/embed/${ytId}?autoplay=1`
    return (
      <iframe
        title={NS.media.video}
        src={src}
        className="aspect-video size-full rounded-md bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }
  if (!direct.trim()) return null
  return <video controls className="aspect-video max-h-[80vh] w-full rounded-md bg-black" src={direct} />
}

/** Detail page gallery (§3.4) — no URLs shown as text. */
export function NewsMediaGalleryDetail({ media }: { media: MediaDto[] }) {
  const list = [...media].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  )
  const [lightboxImage, setLightboxImage] = React.useState<string | null>(
    null,
  )
  const [lightboxVideo, setLightboxVideo] = React.useState<MediaDto | null>(
    null,
  )

  if (!list.length) {
    return (
      <div className="border-muted-foreground/40 text-muted-foreground flex flex-col items-center justify-center gap-3 rounded-md border border-dashed py-12">
        <PhotoIcon className="size-12 opacity-40" aria-hidden />
        <p className="text-sm">{NS.empty.no_media}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {list.map((m, idx) => (
          <MediaTileInner
            key={m.id ?? `${idx}-${m.type}`}
            media={m}
            interactive
            onActivate={() => {
              if (m.type === "DOCUMENT" || m.type === "OTHER") {
                const u = m.url ?? m.externalUrl
                if (u) window.open(u, "_blank", "noopener,noreferrer")
                return
              }
              if (m.type === "AUDIO") {
                const u =
                  m.url ?? m.externalUrl ?? m.embedUrl
                if (u) window.open(u, "_blank", "noopener,noreferrer")
                return
              }
              if (m.type === "VIDEO") {
                setLightboxVideo(m)
                return
              }
              const src = m.url
              if (src) setLightboxImage(src)
            }}
          />
        ))}
      </div>

      <Dialog
        open={Boolean(lightboxImage)}
        onOpenChange={(open) => {
          if (!open) setLightboxImage(null)
        }}
      >
        <DialogContent className="max-w-7xl rounded-lg border border-border bg-background p-4 sm:max-w-7xl">
          <DialogTitle className="sr-only">{NS.section.media}</DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage ?? ""}
            alt=""
            className="mx-auto max-h-[80vh] w-auto rounded-md object-contain"
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(lightboxVideo)}
        onOpenChange={(open) => {
          if (!open) setLightboxVideo(null)
        }}
      >
        <DialogContent className="max-w-7xl rounded-lg border border-border bg-background p-4 sm:max-w-7xl">
          <DialogTitle className="sr-only">{NS.section.media}</DialogTitle>
          {lightboxVideo ? <VideoLightbox media={lightboxVideo} /> : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
