/** Sorani-/Arab-script friendly relative timestamps for system dl rows */

function relativeTimeFormatter(): Intl.RelativeTimeFormat {
  try {
    return new Intl.RelativeTimeFormat("ckb-IQ", { numeric: "auto" })
  } catch {
    try {
      return new Intl.RelativeTimeFormat("ku", { numeric: "auto" })
    } catch {
      return new Intl.RelativeTimeFormat("ar", { numeric: "auto" })
    }
  }
}

/** `dateIso` relative to now (`Intl.RelativeTimeFormat`). */
export function formatRelativeTimeKu(dateIso: string): string {
  const t = new Date(dateIso).getTime()
  if (!Number.isFinite(t)) return "—"

  const MIN = 60
  const HOUR = MIN * 60
  const DAY = HOUR * 24
  const WEEK = DAY * 7
  const MONTH = DAY * 30
  const YEAR = DAY * 365

  const deltaSec = Math.round((t - Date.now()) / 1000)
  const abs = Math.abs(deltaSec)

  const rtf = relativeTimeFormatter()

  if (abs < MIN) return rtf.format(deltaSec, "second")
  if (abs < HOUR)
    return rtf.format(Math.trunc(deltaSec / MIN), "minute")
  if (abs < DAY)
    return rtf.format(Math.trunc(deltaSec / HOUR), "hour")
  if (abs < WEEK)
    return rtf.format(Math.trunc(deltaSec / DAY), "day")
  if (abs < MONTH)
    return rtf.format(Math.trunc(deltaSec / WEEK), "week")
  if (abs < YEAR)
    return rtf.format(Math.trunc(deltaSec / MONTH), "month")
  return rtf.format(Math.trunc(deltaSec / YEAR), "year")
}

export function formatFullTimestampKu(dateIso: string): string {
  const d = new Date(dateIso)
  if (!Number.isFinite(d.getTime())) return "—"
  try {
    return new Intl.DateTimeFormat("ckb-IQ", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d)
  } catch {
    return d.toLocaleString()
  }
}
