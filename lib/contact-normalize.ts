import type { ContactContentDto, ContactDto, ContactPage } from "@/types/contact"

import { unwrapApiData } from "@/lib/about-normalize"

function coerceStr(v: unknown): string | null {
  if (v == null) return null
  if (typeof v === "string") return v
  return String(v)
}

function coerceNum(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function coerceBool(v: unknown): boolean | null {
  if (typeof v === "boolean") return v
  if (v === "true" || v === true) return true
  if (v === "false" || v === false) return false
  return null
}

function normalizeContent(raw: unknown): ContactContentDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  return {
    title: coerceStr(o.title),
    subtitle: coerceStr(o.subtitle),
    address: coerceStr(o.address),
    workingHours:
      coerceStr(o.workingHours) ?? coerceStr(o.working_hours),
    description: coerceStr(o.description),
  }
}

export function normalizeContactDto(raw: unknown): ContactDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>

  return {
    id: coerceNum(o.id) ?? undefined,
    active: coerceBool(o.active) ?? true,
    slugCkb: coerceStr(o.slugCkb) ?? coerceStr(o.slug_ckb),
    slugKmr: coerceStr(o.slugKmr) ?? coerceStr(o.slug_kmr),
    displayOrder: coerceNum(o.displayOrder) ?? coerceNum(o.display_order) ?? undefined,
    ckbContent: normalizeContent(o.ckbContent ?? o.ckb_content),
    kmrContent: normalizeContent(o.kmrContent ?? o.kmr_content),
    phone: coerceStr(o.phone),
    secondaryPhone:
      coerceStr(o.secondaryPhone) ?? coerceStr(o.secondary_phone),
    email: coerceStr(o.email),
    mapEmbedUrl: coerceStr(o.mapEmbedUrl) ?? coerceStr(o.map_embed_url),
    latitude: coerceNum(o.latitude) ?? undefined,
    longitude: coerceNum(o.longitude) ?? undefined,
    createdAt: coerceStr(o.createdAt) ?? coerceStr(o.created_at) ?? undefined,
    updatedAt: coerceStr(o.updatedAt) ?? coerceStr(o.updated_at) ?? undefined,
  }
}

export function normalizeContactPage(raw: unknown): ContactPage {
  const unwrapped = unwrapApiData<unknown>(raw)
  const o = (unwrapped && typeof unwrapped === "object"
    ? unwrapped
    : {}) as Record<string, unknown>

  const contentRaw =
    o.content ?? o.items ?? o.data ?? (Array.isArray(unwrapped) ? unwrapped : [])
  const content = Array.isArray(contentRaw)
    ? contentRaw.map(normalizeContactDto)
    : []

  return {
    content,
    totalElements:
      coerceNum(o.totalElements) ?? coerceNum(o.total_elements) ?? content.length,
    totalPages: coerceNum(o.totalPages) ?? coerceNum(o.total_pages) ?? 1,
    number: coerceNum(o.number) ?? coerceNum(o.page) ?? 0,
    size: coerceNum(o.size) ?? content.length,
  }
}

export function contactDisplayTitle(dto: ContactDto): string {
  return (
    dto.ckbContent?.title?.trim() ||
    dto.kmrContent?.title?.trim() ||
    ""
  )
}
