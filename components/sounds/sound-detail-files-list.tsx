"use client"

import { useState } from "react"
import { BookOpenIcon, PlayIcon } from "@heroicons/react/24/outline"

import { SoundBrochureLightbox } from "@/components/sounds/sound-brochure-lightbox"
import { SoundChannelPill } from "@/components/sounds/sound-channel-pill"
import { NS } from "@/components/sounds/sounds-strings"
import { formatDuration } from "@/lib/sound-format"
import { cn } from "@/lib/utils"
import { useSoundPlayer } from "@/store/sound-player.store"
import type { SoundDto, SoundFileDto } from "@/types/sounds"

export function SoundDetailFilesList({
  sound,
  activeFileId,
  onSelectFile,
}: {
  sound: SoundDto
  activeFileId?: number | null
  onSelectFile: (file: SoundFileDto) => void
}) {
  const files = sound.files ?? []
  const [brochureFile, setBrochureFile] = useState<SoundFileDto | null>(null)
  const play = useSoundPlayer((s) => s.play)

  if (files.length === 0) return null

  const isSingleOne = sound.trackState === "SINGLE" && files.length === 1
  if (isSingleOne) return null

  const title =
    sound.trackState === "MULTI"
      ? `${NS.section.files} (${files.length})`
      : NS.section.file_single

  function playFile(file: SoundFileDto, index: number) {
    onSelectFile(file)
    const src =
      file.fileUrl?.trim() || file.externalUrl?.trim() || file.embedUrl?.trim()
    if (!src || !sound.id) return
    play({
      trackId: sound.id,
      fileId: file.id,
      src,
      title: file.title?.trim() || sound.ckbContent?.title || "",
      subtitle: `${String(index + 1).padStart(2, "0")}`,
    })
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-sm font-medium">{title}</h2>
      <ol className="space-y-2">
        {files.map((file, i) => {
          const src = file.fileUrl?.trim()
          const meta = [
            formatDuration(file.durationSeconds),
            file.fileFormat?.toUpperCase(),
            file.bitRate,
          ]
            .filter(Boolean)
            .join(" · ")
          return (
            <li
              key={file.id ?? i}
              className={cn(
                "border-border/60 flex items-center gap-3 rounded-lg border px-3 py-2",
                activeFileId === file.id && "bg-muted/40",
              )}
            >
              <span className="text-muted-foreground font-mono text-xs tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <button
                type="button"
                disabled={!src && !file.externalUrl && !file.embedUrl}
                onClick={() => playFile(file, i)}
                className="bg-primary/10 text-primary hover:bg-primary/20 flex size-8 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
              >
                <PlayIcon className="size-4" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {file.title?.trim() || NS.file.no_title}
                </p>
                <p className="text-muted-foreground text-xs">
                  {meta}
                  {file.audioChannel ? (
                    <>
                      {" · "}
                      <SoundChannelPill channel={file.audioChannel} />
                    </>
                  ) : null}
                </p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  {file.genre ? (
                    <span className="text-muted-foreground">{file.genre}</span>
                  ) : null}
                  {file.recordingVenue ? (
                    <span className="text-muted-foreground">
                      {file.recordingVenue}
                    </span>
                  ) : null}
                </div>
              </div>
              {(file.brochures?.length ?? 0) > 0 ? (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
                  onClick={() => setBrochureFile(file)}
                >
                  <BookOpenIcon className="size-4" />
                  {file.brochures!.length}
                </button>
              ) : null}
            </li>
          )
        })}
      </ol>
      <SoundBrochureLightbox
        open={brochureFile != null}
        onOpenChange={(o) => {
          if (!o) setBrochureFile(null)
        }}
        brochures={brochureFile?.brochures ?? []}
      />
    </section>
  )
}
