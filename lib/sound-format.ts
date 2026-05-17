import type { AudioChannel } from "@/types/sounds"

/** Format seconds as MM:SS or HH:MM:SS for display. */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "—"
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

/** Format bytes as KB / MB / GB. */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return "—"
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"] as const
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function audioChannelLabel(ch: AudioChannel | null | undefined): string {
  if (ch === "MONO") return "MONO"
  if (ch === "STEREO") return "STEREO"
  return "—"
}

export function guessAttachmentTypeFromMime(
  mime: string | undefined,
): "PDF" | "VIDEO" | "IMAGE" | "AUDIO" | "OTHER" {
  if (!mime) return "OTHER"
  const m = mime.toLowerCase()
  if (m.includes("pdf")) return "PDF"
  if (m.startsWith("video/")) return "VIDEO"
  if (m.startsWith("image/")) return "IMAGE"
  if (m.startsWith("audio/")) return "AUDIO"
  return "OTHER"
}

export function guessFileFormatFromName(name: string): string {
  const ext = name.split(".").pop()?.toUpperCase()
  return ext ?? ""
}
