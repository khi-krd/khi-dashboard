const NUMBER_LOCALE = "ckb-IQ"
const NUMBER_FALLBACK = "ar-IQ"

function parseIsoDate(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

/** Standard display date: DD/MM/YYYY */
export function formatStandardDate(d: Date): string {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`
}

/** Standard display datetime: DD/MM/YYYY HH:MM */
export function formatStandardDateTime(d: Date): string {
  return `${formatStandardDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function formatCkbDigits(n: number): string {
  try {
    return new Intl.NumberFormat(NUMBER_LOCALE, {
      numberingSystem: "arab",
    }).format(n)
  } catch {
    return new Intl.NumberFormat(NUMBER_FALLBACK, {
      numberingSystem: "arab",
    }).format(n)
  }
}

export function formatNewsDateShort(
  iso: string | null | undefined,
): string {
  const d = parseIsoDate(iso)
  if (!d) return "—"
  return formatStandardDate(d)
}

export function formatNewsDateLong(
  iso: string | null | undefined,
): string {
  const d = parseIsoDate(iso)
  if (!d) return "—"
  return formatStandardDateTime(d)
}

export function compareDateDesc(a: string | null | undefined, b: string | null | undefined) {
  const ta = a ? new Date(a).getTime() : 0
  const tb = b ? new Date(b).getTime() : 0
  return tb - ta
}
