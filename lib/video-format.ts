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

/** Format file size in MB; auto-switch to GB when >= 1024 MB. */
export function formatFileSizeMb(mb: number | null | undefined): string {
  if (mb == null || !Number.isFinite(mb) || mb < 0) return "—"
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`
  }
  return `${mb.toFixed(1)} MB`
}
