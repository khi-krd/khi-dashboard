import type { ServiceContentDto, ServiceDto } from "@/types/services"

function coerceInt(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v.trim())
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function coerceStr(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null
}

function coerceBool(v: unknown, fallback = true): boolean {
  if (typeof v === "boolean") return v
  if (v === "true" || v === true) return true
  if (v === "false" || v === false) return false
  return fallback
}

function normalizeContentDto(raw: unknown): ServiceContentDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const lang = o.languageCode ?? o.language_code
  if (lang !== "CKB" && lang !== "KMR") return null
  const title = coerceStr(o.title)
  if (!title) return null
  return {
    id: coerceInt(o.id),
    languageCode: lang,
    title,
    description:
      typeof o.description === "string" ? o.description : undefined,
  }
}

function normalizeContentsList(raw: unknown): ServiceContentDto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizeContentDto)
    .filter((c): c is ServiceContentDto => c != null)
}

export function normalizeServiceDto(d: ServiceDto): ServiceDto {
  const contents =
    d.contents?.length > 0 ? normalizeContentsList(d.contents) : []
  const contentLanguages =
    d.contentLanguages?.filter((l): l is "CKB" | "KMR" => l === "CKB" || l === "KMR") ??
    contents.map((c) => c.languageCode)

  return {
    ...d,
    active: coerceBool(d.active, true),
    serviceType: d.serviceType?.trim() ?? "",
    location: d.location?.trim() || null,
    contents,
    contentLanguages:
      contentLanguages.length > 0 ? contentLanguages : ["CKB"],
  }
}
