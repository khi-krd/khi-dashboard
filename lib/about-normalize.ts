import type {
  AboutContentDto,
  AboutDto,
  AboutPage,
  AboutStatus,
  Language,
  StatItemDto,
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

function normalizeLanguages(raw: unknown): Language[] {
  if (!raw) return ["CKB"]
  if (raw instanceof Set) return [...raw] as Language[]
  if (Array.isArray(raw)) {
    return raw.filter((x): x is Language => x === "CKB" || x === "KMR")
  }
  return ["CKB"]
}

function normalizeStatus(raw: unknown): AboutStatus {
  const s = coerceStr(raw)?.toUpperCase()
  if (s === "ACTIVE" || s === "ARCHIVED" || s === "DRAFT") return s
  return "DRAFT"
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

function normalizeStat(raw: unknown): StatItemDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const value =
    coerceStr(o.value) ?? (o.value != null ? String(o.value) : null)
  if (!value?.trim()) return null
  return {
    labelCkb: coerceStr(o.labelCkb) ?? coerceStr(o.label_ckb),
    labelKmr: coerceStr(o.labelKmr) ?? coerceStr(o.label_kmr),
    value: value.trim(),
  }
}

function normalizeStats(raw: unknown): StatItemDto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizeStat)
    .filter((s): s is StatItemDto => s != null)
}

/** Legacy blocks[] → body HTML + stats during API transition. */
function legacyBlocksToContent(
  blocksRaw: unknown,
): { bodyCkb: string; bodyKmr: string; stats: StatItemDto[] } {
  if (!Array.isArray(blocksRaw)) {
    return { bodyCkb: "", bodyKmr: "", stats: [] }
  }
  const textPartsCkb: string[] = []
  const textPartsKmr: string[] = []
  const stats: StatItemDto[] = []

  for (const block of blocksRaw) {
    if (!block || typeof block !== "object") continue
    const o = block as Record<string, unknown>
    const type = coerceStr(o.type)?.toUpperCase()
    if (type === "STAT") {
      const value =
        coerceStr(o.value) ?? (o.value != null ? String(o.value) : "")
      if (value.trim()) {
        stats.push({
          labelCkb: coerceStr(o.labelCkb) ?? coerceStr(o.label_ckb),
          labelKmr: coerceStr(o.labelKmr) ?? coerceStr(o.label_kmr),
          value: value.trim(),
        })
      }
      continue
    }
    if (type === "TEXT" || type === "QUOTE") {
      const bodyCkb = coerceStr(o.bodyCkb) ?? coerceStr(o.body_ckb)
      const bodyKmr = coerceStr(o.bodyKmr) ?? coerceStr(o.body_kmr)
      const textCkb = coerceStr(o.textCkb) ?? coerceStr(o.text_ckb)
      const textKmr = coerceStr(o.textKmr) ?? coerceStr(o.text_kmr)
      if (bodyCkb?.trim()) textPartsCkb.push(bodyCkb.trim())
      else if (textCkb?.trim()) textPartsCkb.push(`<p>${textCkb.trim()}</p>`)
      if (bodyKmr?.trim()) textPartsKmr.push(bodyKmr.trim())
      else if (textKmr?.trim()) textPartsKmr.push(`<p>${textKmr.trim()}</p>`)
    }
  }

  return {
    bodyCkb: textPartsCkb.join(""),
    bodyKmr: textPartsKmr.join(""),
    stats,
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

  let ckbContent =
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

  let kmrContent =
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

  let stats = normalizeStats(o.stats)

  const blocksRaw = o.blocks ?? o.contentBlocks ?? o.content_blocks
  if (Array.isArray(blocksRaw) && blocksRaw.length > 0) {
    const legacy = legacyBlocksToContent(blocksRaw)
    if (!ckbContent?.body?.trim() && legacy.bodyCkb) {
      ckbContent = { ...ckbContent, body: legacy.bodyCkb }
    }
    if (!kmrContent?.body?.trim() && legacy.bodyKmr) {
      kmrContent = { ...kmrContent, body: legacy.bodyKmr }
    }
    if (stats.length === 0 && legacy.stats.length > 0) {
      stats = legacy.stats
    }
  }

  return {
    id: coerceNum(o.id) ?? undefined,
    status: normalizeStatus(o.status),
    slugCkb: coerceStr(o.slugCkb) ?? coerceStr(o.slug_ckb),
    slugKmr: coerceStr(o.slugKmr) ?? coerceStr(o.slug_kmr),
    heroImageUrl:
      coerceStr(o.heroImageUrl) ??
      coerceStr(o.hero_image_url) ??
      coerceStr(o.heroImage) ??
      coerceStr(o.hero_image),
    ckbContent,
    kmrContent,
    stats,
    contentLanguages: normalizeLanguages(o.contentLanguages ?? o.content_languages),
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
