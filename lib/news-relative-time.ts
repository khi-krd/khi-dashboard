/** Sorani-/Arab-script friendly relative timestamps for system dl rows */

function relativeTimeFormatter(): Intl.RelativeTimeFormat {
  try {
    return new Intl.RelativeTimeFormat("ckb-IQ", { numeric: "always" })
  } catch {
    try {
      return new Intl.RelativeTimeFormat("ku", { numeric: "always" })
    } catch {
      return new Intl.RelativeTimeFormat("ar", { numeric: "always" })
    }
  }
}

function hasArabicScript(s: string) {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(s)
}

/** English / token fallbacks when `Intl` has no Sorani strings. */
function formatRelativeTimeKuFallback(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
): string {
  const abs = Math.abs(value)
  const past = value < 0
  const ago = past ? " لەمەوبەر" : " لە دوای ئێستا"

  const unitLabel: Partial<Record<Intl.RelativeTimeFormatUnit, [string, string]>> = {
    second: ["چرکە", "چرکە"],
    minute: ["خولەک", "خولەک"],
    hour: ["کاتژمێر", "کاتژمێر"],
    day: ["ڕۆژ", "ڕۆژ"],
    week: ["هەفتە", "هەفتە"],
    month: ["مانگ", "مانگ"],
    quarter: ["چارەک", "چارەک"],
    year: ["ساڵ", "ساڵ"],
  }

  if (unit === "month" && past && abs === 1) return "مانگی ڕابردوو"
  if (unit === "year" && past && abs === 1) return "ساڵی ڕابردوو"
  if (unit === "day" && past && abs === 1) return "دوێنێ"
  if (unit === "week" && past && abs === 1) return "هەفتەی ڕابردوو"

  const [one, many] = unitLabel[unit] ?? ["", ""]
  const label = abs === 1 ? one : many
  return `${abs} ${label}${ago}`
}

function formatRelativeUnit(
  rtf: Intl.RelativeTimeFormat,
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
): string {
  const formatted = rtf.format(value, unit)
  if (hasArabicScript(formatted)) return formatted
  if (/^[a-z0-9_\s-]+$/i.test(formatted)) {
    return formatRelativeTimeKuFallback(value, unit)
  }
  return formatted
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

  if (abs < MIN) return formatRelativeUnit(rtf, deltaSec, "second")
  if (abs < HOUR)
    return formatRelativeUnit(rtf, Math.trunc(deltaSec / MIN), "minute")
  if (abs < DAY)
    return formatRelativeUnit(rtf, Math.trunc(deltaSec / HOUR), "hour")
  if (abs < WEEK)
    return formatRelativeUnit(rtf, Math.trunc(deltaSec / DAY), "day")
  if (abs < MONTH)
    return formatRelativeUnit(rtf, Math.trunc(deltaSec / WEEK), "week")
  if (abs < YEAR)
    return formatRelativeUnit(rtf, Math.trunc(deltaSec / MONTH), "month")
  return formatRelativeUnit(rtf, Math.trunc(deltaSec / YEAR), "year")
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
