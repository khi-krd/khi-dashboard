"use client"

import {
  ArrowsPointingOutIcon,
  DocumentIcon,
  DocumentTextIcon,
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
} from "@/components/projects/project-media-helpers"
import { NS } from "@/components/projects/projects-strings"
import type { ProjectMediaDto } from "@/types/projects"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

function videoEmbedSrc(
  media: ProjectMediaDto,
): { type: "iframe"; src: string } | { type: "video"; src: string } | null {
  const bundle = media.embedUrl ?? media.externalUrl ?? media.url ?? ""
  const yt = extractYoutubeId(bundle)
  if (yt) return { type: "iframe", src: `https://www.youtube.com/embed/${yt}?autoplay=1` }
  const vm = extractVimeoId(bundle)
  if (vm) return { type: "iframe", src: `https://player.vimeo.com/video/${vm}?autoplay=1` }
  const direct = (media.url ?? media.externalUrl ?? "").trim()
  if (direct) return { type: "video", src: direct }
  return null
}

function videoThumbUrl(media: ProjectMediaDto): string | null {
  const bundle = media.embedUrl ?? media.externalUrl ?? media.url ?? ""
  const yt = youtubeThumb(bundle)
  if (yt) return yt
  const vm = extractVimeoId(bundle)
  return vm ? vimeoPosterUrl(vm) : null
}

function mediaClickUrl(m: ProjectMediaDto): string | null {
  return (m.url ?? m.externalUrl ?? m.embedUrl ?? "").trim() || null
}

function CaptionStrip({ caption }: { caption?: string | null }) {
  const t = caption?.trim()
  if (!t) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent px-2 pb-2 pt-6">
      <p className="text-foreground/90 line-clamp-2 text-xs">{t}</p>
    </div>
  )
}

export function ProjectDetailMediaGrid({ media }: { media: ProjectMediaDto[] }) {
  const list = [...media].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  )

  const [lightbox, setLightbox] = React.useState<
    | { kind: "image"; src: string }
    | { kind: "video"; media: ProjectMediaDto }
    | { kind: "audio"; src: string }
    | null
  >(null)

  if (!list.length) return null

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {list.map((m, idx) => (
          <MediaTile
            key={m.id ?? `${idx}-${m.mediaType}`}
            media={m}
            onOpen={() => {
              if (m.mediaType === "PDF" || m.mediaType === "DOCUMENT") {
                const u = mediaClickUrl(m)
                if (u) window.open(u, "_blank", "noopener,noreferrer")
                return
              }
              if (m.mediaType === "AUDIO") {
                const u = mediaClickUrl(m)
                if (u) setLightbox({ kind: "audio", src: u })
                return
              }
              if (m.mediaType === "VIDEO") {
                if (videoEmbedSrc(m)) {
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

      <Dialog open={lightbox?.kind === "image"} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-7xl rounded-lg border border-border bg-background p-4">
          <DialogTitle className="sr-only">{NS.section.media}</DialogTitle>
          {lightbox?.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lightbox.src} alt="" className="mx-auto max-h-[80vh] w-auto rounded-md object-contain" />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={lightbox?.kind === "video"} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-7xl rounded-lg border border-border bg-background p-4">
          <DialogTitle className="sr-only">video</DialogTitle>
          {lightbox?.kind === "video" ? <VideoLightboxBody media={lightbox.media} /> : null}
        </DialogContent>
      </Dialog>

      <Dialog open={lightbox?.kind === "audio"} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-lg rounded-lg border border-border bg-background p-4">
          <DialogTitle className="sr-only">{NS.media.audio}</DialogTitle>
          {lightbox?.kind === "audio" ? (
            <audio controls className="w-full" src={lightbox.src} />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function VideoLightboxBody({ media }: { media: ProjectMediaDto }) {
  const v = videoEmbedSrc(media)
  if (!v) return null
  if (v.type === "iframe") {
    return (
      <iframe
        title="video"
        src={v.src}
        className="aspect-video size-full rounded-md bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }
  return <video controls className="aspect-video max-h-[80vh] w-full rounded-md bg-black" src={v.src} />
}

function MediaTile({ media: m, onOpen }: { media: ProjectMediaDto; onOpen: () => void }) {
  const thumb = m.mediaType === "VIDEO" ? videoThumbUrl(m) : null
  const type = m.mediaType

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group border-border bg-muted relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg border text-start"
    >
      {type === "IMAGE" && m.url ? (
        <Image src={m.url} alt="" fill className="object-cover" sizes="200px" unoptimized={m.url.startsWith("http")} />
      ) : type === "VIDEO" ? (
        <>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-zinc-900" />
          )}
          <PlayIcon className="text-primary pointer-events-none absolute inset-0 m-auto size-12 rtl:rotate-180" />
        </>
      ) : type === "AUDIO" ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/80">
          <SpeakerWaveIcon className="text-muted-foreground size-12" />
          <span className="text-muted-foreground absolute bottom-8 start-2 text-xs">{NS.media.audio}</span>
        </div>
      ) : type === "PDF" ? (
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <DocumentTextIcon className="text-muted-foreground size-12" />
          <span className="text-muted-foreground text-xs">{NS.media.pdf}</span>
        </div>
      ) : type === "DOCUMENT" ? (
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <DocumentIcon className="text-muted-foreground size-12" />
          <span className="text-muted-foreground text-xs">{NS.media.document}</span>
        </div>
      ) : (
        <PhotoIcon className="text-muted-foreground/50 m-auto size-12" />
      )}
      <CaptionStrip caption={m.caption} />
      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25" />
      <ArrowsPointingOutIcon className="pointer-events-none absolute end-2 top-2 size-4 text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100" />
    </button>
  )
}
