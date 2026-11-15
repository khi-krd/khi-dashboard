"use client"

import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import { toast } from "sonner"

import { NS } from "@/components/donations/donations-strings"
import { cn } from "@/lib/utils"

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp", "avif"])

function fileNameFromUrl(url: string): string {
  try {
    const last = new URL(url).pathname.split("/").pop() ?? ""
    return decodeURIComponent(last) || url
  } catch {
    return url.split("/").pop() ?? url
  }
}

function extensionOf(url: string): string {
  const clean = url.split("?")[0].split("#")[0]
  const last = clean.split(".").pop() ?? ""
  return last.length <= 5 ? last.toLowerCase() : ""
}

/**
 * Renders a donation attachment: image thumbnails preview inline, everything
 * else gets a file chip. Open always works; download fetches the object and
 * saves it under its stored name (falls back to opening when the fetch is
 * blocked, e.g. by storage CORS).
 */
export function DonationAttachment({ url }: { url: string }) {
  const [downloading, setDownloading] = useState(false)
  const trimmed = url.trim()
  if (!trimmed) return null

  const ext = extensionOf(trimmed)
  const isImage = IMAGE_EXTENSIONS.has(ext)
  const name = fileNameFromUrl(trimmed)

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch(trimmed, { mode: "cors" })
      if (!res.ok) throw new Error(String(res.status))
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = objectUrl
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      // Storage may not allow cross-origin reads — opening the file is the
      // graceful fallback the browser can always perform.
      window.open(trimmed, "_blank", "noopener,noreferrer")
      toast.error(NS.error.generic)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-2">
      {isImage ? (
        <a
          href={trimmed}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border/60 block overflow-hidden rounded-lg border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- storage URLs are dynamic */}
          <img
            src={trimmed}
            alt={name}
            className="max-h-48 w-full object-cover"
            loading="lazy"
          />
        </a>
      ) : null}

      <div className="border-border/60 bg-card/50 flex items-center gap-3 rounded-lg border px-3 py-2">
        <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
          <DocumentIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium" dir="ltr">
            {name}
          </p>
          {ext ? (
            <p className="text-muted-foreground text-[10px] uppercase">{ext}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            title={NS.archive.downloadAttachment}
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors",
              downloading && "opacity-50",
            )}
          >
            <ArrowDownTrayIcon className="size-4" />
          </button>
          <a
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            title={NS.action.openAttachment}
            className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="size-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
