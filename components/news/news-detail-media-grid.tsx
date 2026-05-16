"use client"

import {
  ArrowsPointingOutIcon,
  DocumentIcon,
  PhotoIcon,
  PlayIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import * as React from "react"

import {
  extractVimeoId,
  extractYoutubeId,
  vimeoPosterUrl,
  youtubeThumb,
} from "@/components/news/news-media-helpers"
import { NS } from "@/components/news/news-strings"
import type { MediaDto } from "@/types/news"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

function videoEmbedSrc(media: MediaDto): { type: "iframe"; src: string } | { type: "video"; src: string } | null {
  const bundle = media.embedUrl ?? media.externalUrl ?? media.url ?? ""
  const yt = extractYoutubeId(bundle)
  if (yt) {
    return {
      type: "iframe",
      src: `https://www.youtube.com/embed/${yt}?autoplay=1`,
    }
  }
  const vm = extractVimeoId(bundle)
  if (vm) {
    return {
      type: "iframe",
      src: `https://player.vimeo.com/video/${vm}?autoplay=1`,
    }
  }
  const direct = (media.url ?? media.externalUrl ?? "").trim()
  if (direct) return { type: "video", src: direct }
  return null
}

function videoThumbUrl(media: MediaDto): string | null {
  const bundle = media.embedUrl ?? media.externalUrl ?? media.url ?? ""
  const yt = youtubeThumb(bundle)
  if (yt) return yt
  const vm = extractVimeoId(bundle)
  return vm ? vimeoPosterUrl(vm) : null
}

function mediaClickUrl(m: MediaDto): string | null {
  return (m.url ?? m.externalUrl ?? m.embedUrl ?? "").trim() || null
}

export function NewsDetailMediaGrid({ media }: { media: MediaDto[] }) {
  const list = [...media].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  )

  const [lightbox, setLightbox] = React.useState<
    | { kind: "image"; src: string }
    | { kind: "video"; media: MediaDto }
    | { kind: "audio"; src: string }
    | null
  >(null)

  if (!list.length) return null

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {list.map((m, idx) => (
          <MediaTile
            key={m.id ?? `${idx}-${m.type}`}
            media={m}
            onOpen={() => {
              if (m.type === "DOCUMENT" || m.type === "OTHER") {
                const u = mediaClickUrl(m)
                if (u) window.open(u, "_blank", "noopener,noreferrer")
                return
              }
              if (m.type === "AUDIO") {
                const u = mediaClickUrl(m)
                if (u) setLightbox({ kind: "audio", src: u })
                return
              }
              if (m.type === "VIDEO") {
                const embed = videoEmbedSrc(m)
                if (embed) {
                  setLightbox({ kind: "video", media: m })
                  return
                }
                const u = mediaClickUrl(m)
                if (u) window.open(u, "_blank", "noopener,noreferrer")
                return
              }
              const src = m.url?.trim()
              if (src) setLightbox({ kind: "image", src })
            }}
          />
        ))}
      </div>

      <Dialog
        open={lightbox?.kind === "image"}
        onOpenChange={(o) => {
          if (!o) setLightbox(null)
        }}
      >
        <DialogContent className="max-w-7xl rounded-lg border border-border bg-background p-4 sm:max-w-7xl">
          <DialogTitle className="sr-only">{NS.section.media}</DialogTitle>
          {lightbox?.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lightbox.src}
              alt=""
              className="mx-auto max-h-[80vh] w-auto rounded-md object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={lightbox?.kind === "video"}
        onOpenChange={(o) => {
          if (!o) setLightbox(null)
        }}
      >
        <DialogContent className="max-w-7xl rounded-lg border border-border bg-background p-4 sm:max-w-7xl">
          <DialogTitle className="sr-only">{NS.media.video}</DialogTitle>
          {lightbox?.kind === "video" ? (
            <VideoLightboxBody media={lightbox.media} />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={lightbox?.kind === "audio"}
        onOpenChange={(o) => {
          if (!o) setLightbox(null)
        }}
      >
        <DialogContent className="max-w-lg rounded-lg border border-border bg-background p-4">
          <DialogTitle className="sr-only">{NS.media.audio}</DialogTitle>
          {lightbox?.kind === "audio" ? (
            <audio controls className="w-full" src={lightbox.src}>
              {NS.media.audio}
            </audio>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function VideoLightboxBody({ media }: { media: MediaDto }) {
  const v = videoEmbedSrc(media)
  if (!v) return null
  if (v.type === "iframe") {
    return (
      <iframe
        title={NS.media.video}
        src={v.src}
        className="aspect-video size-full rounded-md bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }
  return (
    <video
      controls
      className="aspect-video max-h-[80vh] w-full rounded-md bg-black"
      src={v.src}
    />
  )
}

function MediaTile({
  media: m,
  onOpen,
}: {
  media: MediaDto
  onOpen: () => void
}) {
  const thumb = m.type === "VIDEO" ? videoThumbUrl(m) : null

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group border-border bg-muted relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg border text-start"
    >
      {m.type === "IMAGE" ? (
        m.url ? (
          <Image
            src={m.url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 45vw, 200px"
            unoptimized={m.url.startsWith("http")}
          />
        ) : (
          <PhotoIcon className="text-muted-foreground/50 m-auto size-12" />
        )
      ) : m.type === "VIDEO" ? (
        <>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-zinc-900" />
          )}
          <PlayIcon className="text-primary pointer-events-none absolute inset-0 m-auto size-12 rtl:rotate-180" />
          <span className="text-muted-foreground pointer-events-none absolute bottom-2 start-2 z-[1] rounded-md bg-background/80 px-1.5 py-0.5 text-[0.6875rem] font-medium backdrop-blur-sm">
            {NS.media.video}
          </span>
        </>
      ) : m.type === "AUDIO" ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/80">
          <SpeakerWaveIcon className="text-muted-foreground size-12" />
          <div
            aria-hidden
            className="absolute bottom-2 start-2 end-2 flex h-6 items-end justify-center gap-0.5"
          >
            {[8, 14, 22, 12, 18, 10].map((h, i) => (
              <div
                key={i}
                className="bg-muted-foreground/40 w-1 rounded-sm"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <span className="text-muted-foreground absolute bottom-2 start-2 text-xs">
            {NS.media.audio}
          </span>
        </div>
      ) : m.type === "DOCUMENT" ? (
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <DocumentIcon className="text-muted-foreground size-12" />
          <span className="text-muted-foreground absolute bottom-2 start-2 text-xs">
            {NS.media.document}
          </span>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <PhotoIcon className="text-muted-foreground size-10 opacity-50" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25" />
      <ArrowsPointingOutIcon className="pointer-events-none absolute end-2 top-2 size-4 text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100" />
    </button>
  )
}
