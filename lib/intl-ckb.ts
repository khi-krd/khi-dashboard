const NUMBER_LOCALE = "ckb-IQ"
const NUMBER_FALLBACK = "ar-IQ"
const DATE_LOCALE = "ckb-IQ"
const DATE_FALLBACK = "ar-IQ"

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
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  try {
    return new Intl.DateTimeFormat(DATE_LOCALE, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d)
  } catch {
    return new Intl.DateTimeFormat(DATE_FALLBACK, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d)
  }
}

export function formatNewsDateLong(
  iso: string | null | undefined,
): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  try {
    return new Intl.DateTimeFormat(DATE_LOCALE, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d)
  } catch {
    return new Intl.DateTimeFormat(DATE_FALLBACK, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d)
  }
}

export function compareDateDesc(a: string | null | undefined, b: string | null | undefined) {
  const ta = a ? new Date(a).getTime() : 0
  const tb = b ? new Date(b).getTime() : 0
  return tb - ta
}
