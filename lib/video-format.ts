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

/**
 * Parse a typed duration into whole seconds. Accepts "MM:SS", "HH:MM:SS" or a
 * bare second count ("754"); returns null for blank/invalid input.
 */
export function parseDuration(input: string | null | undefined): number | null {
  const t = input?.trim()
  if (!t) return null
  const parts = t.split(":")
  if (parts.length > 3) return null
  const nums = parts.map((p) => p.trim())
  if (nums.some((p) => !/^\d+$/.test(p))) return null
  if (parts.length > 1 && nums.slice(1).some((p) => p.length !== 2)) return null
  const seconds =
    nums.length === 3
      ? +nums[0] * 3600 + +nums[1] * 60 + +nums[2]
      : nums.length === 2
        ? +nums[0] * 60 + +nums[1]
        : +nums[0]
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null
}

/** Format file size in MB; auto-switch to GB when >= 1024 MB. */
export function formatFileSizeMb(mb: number | null | undefined): string {
  if (mb == null || !Number.isFinite(mb) || mb < 0) return "—"
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`
  }
  return `${mb.toFixed(1)} MB`
}
