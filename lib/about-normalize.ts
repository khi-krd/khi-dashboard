import type {
  AboutContentDto,
  AboutDto,
  AboutPage,
} from "@/types/about"

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

function coerceBool(v: unknown, fallback = true): boolean {
  if (typeof v === "boolean") return v
  if (v === "true" || v === true) return true
  if (v === "false" || v === false) return false
  return fallback
}

function normalizeContent(raw: unknown): AboutContentDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  return {
    title: coerceStr(o.title),
    subtitle: coerceStr(o.subtitle),
    metaDescription:
      coerceStr(o.metaDescription) ??
      coerceStr(o.meta_description) ??
      coerceStr(o.seoDescription) ??
      coerceStr(o.seo_description),
    body: coerceStr(o.body),
  }
}

export function unwrapApiData<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in raw) {
    const envelope = raw as { success?: boolean; data?: T }
    if (envelope.data != null) return envelope.data
  }
  return raw as T
}

export function normalizeAboutDto(raw: unknown): AboutDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>

  const ckbContent =
    normalizeContent(o.ckbContent ?? o.ckb_content) ??
    normalizeContent({
      title: o.titleCkb ?? o.title_ckb,
      subtitle: o.subtitleCkb ?? o.subtitle_ckb,
      metaDescription:
        o.seoDescriptionCkb ??
        o.seo_description_ckb ??
        o.metaDescriptionCkb,
      body: o.bodyCkb ?? o.body_ckb,
    })

  const kmrContent =
    normalizeContent(o.kmrContent ?? o.kmr_content) ??
    normalizeContent({
      title: o.titleKmr ?? o.title_kmr,
      subtitle: o.subtitleKmr ?? o.subtitle_kmr,
      metaDescription:
        o.seoDescriptionKmr ??
        o.seo_description_kmr ??
        o.metaDescriptionKmr,
      body: o.bodyKmr ?? o.body_kmr,
    })

  const legacyStatus = coerceStr(o.status)?.toUpperCase()
  const active =
    typeof o.active === "boolean"
      ? o.active
      : legacyStatus === "ACTIVE"
        ? true
        : legacyStatus === "DRAFT" || legacyStatus === "ARCHIVED"
          ? false
          : coerceBool(o.active, true)

  return {
    id: coerceNum(o.id) ?? undefined,
    active,
    slugCkb: coerceStr(o.slugCkb) ?? coerceStr(o.slug_ckb),
    slugKmr: coerceStr(o.slugKmr) ?? coerceStr(o.slug_kmr),
    ckbContent,
    kmrContent,
    displayOrder: coerceNum(o.displayOrder) ?? coerceNum(o.display_order) ?? undefined,
    createdAt: coerceStr(o.createdAt) ?? coerceStr(o.created_at) ?? undefined,
    updatedAt: coerceStr(o.updatedAt) ?? coerceStr(o.updated_at) ?? undefined,
  }
}

export function normalizeAboutPage(raw: unknown): AboutPage {
  const unwrapped = unwrapApiData<unknown>(raw)
  const o = (unwrapped && typeof unwrapped === "object"
    ? unwrapped
    : {}) as Record<string, unknown>

  const contentRaw =
    o.content ?? o.items ?? o.data ?? (Array.isArray(unwrapped) ? unwrapped : [])
  const content = Array.isArray(contentRaw)
    ? contentRaw.map(normalizeAboutDto)
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

/** Flat title for list/breadcrumb (CKB preferred). */
export function aboutDisplayTitle(dto: AboutDto): string {
  return (
    dto.ckbContent?.title?.trim() ||
    dto.kmrContent?.title?.trim() ||
    ""
  )
}
