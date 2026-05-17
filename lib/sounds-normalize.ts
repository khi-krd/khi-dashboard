import type {
  AttachmentDto,
  AttachmentType,
  AudioChannel,
  BrochureDto,
  FileType,
  Language,
  SoundContentDto,
  SoundDto,
  SoundFileDto,
  SoundPage,
  TopicDto,
  TrackState,
} from "@/types/sounds"

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

function coerceBool(v: unknown): boolean {
  if (v === true || v === "true" || v === 1) return true
  return false
}

function coerceStringArray(raw: unknown): string[] {
  if (!raw) return []
  if (raw instanceof Set) return [...raw].map(String)
  if (Array.isArray(raw)) return raw.map(String)
  return []
}

function normalizeContent(raw: unknown): SoundContentDto | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  return {
    title: coerceStr(o.title) ?? undefined,
    description: coerceStr(o.description) ?? undefined,
  }
}

function normalizeBrochure(raw: unknown): BrochureDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  return {
    id: coerceNum(o.id) ?? undefined,
    imageUrl: coerceStr(o.imageUrl) ?? coerceStr(o.image_url),
    caption: coerceStr(o.caption),
    brochureOrder:
      coerceNum(o.brochureOrder) ?? coerceNum(o.brochure_order) ?? undefined,
  }
}

function normalizeFile(raw: unknown): SoundFileDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const brochures = Array.isArray(o.brochures)
    ? o.brochures.map(normalizeBrochure)
    : []
  const channel = coerceStr(o.audioChannel) ?? coerceStr(o.audio_channel)
  return {
    id: coerceNum(o.id) ?? undefined,
    fileUrl: coerceStr(o.fileUrl) ?? coerceStr(o.file_url),
    externalUrl: coerceStr(o.externalUrl) ?? coerceStr(o.external_url),
    embedUrl: coerceStr(o.embedUrl) ?? coerceStr(o.embed_url),
    title: coerceStr(o.title),
    fileType: (coerceStr(o.fileType) ?? coerceStr(o.file_type) ?? "AUDIO") as FileType,
    publishmentYear:
      coerceNum(o.publishmentYear) ?? coerceNum(o.publishment_year),
    fileFormat: coerceStr(o.fileFormat) ?? coerceStr(o.file_format),
    sizeBytes: coerceNum(o.sizeBytes) ?? coerceNum(o.size_bytes),
    durationSeconds:
      coerceNum(o.durationSeconds) ?? coerceNum(o.duration_seconds),
    bitRate: coerceStr(o.bitRate) ?? coerceStr(o.bit_rate),
    sampleRate: coerceStr(o.sampleRate) ?? coerceStr(o.sample_rate),
    audioChannel:
      channel === "MONO" || channel === "STEREO"
        ? (channel as AudioChannel)
        : null,
    form: coerceStr(o.form),
    genre: coerceStr(o.genre),
    recordingVenue:
      coerceStr(o.recordingVenue) ?? coerceStr(o.recording_venue),
    brochures: brochures.sort(
      (a, b) => (a.brochureOrder ?? 0) - (b.brochureOrder ?? 0),
    ),
  }
}

function normalizeAttachment(raw: unknown): AttachmentDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const type = coerceStr(o.attachmentType) ?? coerceStr(o.attachment_type)
  return {
    id: coerceNum(o.id) ?? undefined,
    fileUrl: coerceStr(o.fileUrl) ?? coerceStr(o.file_url),
    title: coerceStr(o.title),
    attachmentType: (type ?? "OTHER") as AttachmentType,
    sizeBytes: coerceNum(o.sizeBytes) ?? coerceNum(o.size_bytes),
    mimeType: coerceStr(o.mimeType) ?? coerceStr(o.mime_type),
    attachmentOrder:
      coerceNum(o.attachmentOrder) ?? coerceNum(o.attachment_order) ?? undefined,
  }
}

function normalizeLanguages(raw: unknown): Language[] {
  if (!raw) return ["CKB"]
  if (raw instanceof Set) return [...raw] as Language[]
  if (Array.isArray(raw)) {
    return raw.filter((x): x is Language => x === "CKB" || x === "KMR")
  }
  return ["CKB"]
}

function normalizeTags(raw: unknown, ckbKey: string, kmrKey: string): {
  tagsCkb: string[]
  tagsKmr: string[]
} {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  if (Array.isArray(raw)) {
    return { tagsCkb: raw.map(String), tagsKmr: [] }
  }
  const ckb = o.ckb ?? o[ckbKey]
  const kmr = o.kmr ?? o[kmrKey]
  return {
    tagsCkb: coerceStringArray(ckb),
    tagsKmr: coerceStringArray(kmr),
  }
}

export function normalizeSoundDto(raw: unknown): SoundDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>

  const files = Array.isArray(o.files)
    ? o.files.map(normalizeFile)
    : []
  const attachments = Array.isArray(o.attachments)
    ? o.attachments.map(normalizeAttachment)
    : []

  const tagsFromBilingual = normalizeTags(o.tags, "tagsCkb", "tagsKmr")
  const keywordsFromBilingual = normalizeTags(o.keywords, "keywordsCkb", "keywordsKmr")

  const trackState: TrackState =
    o.trackState === "MULTI" || o.track_state === "MULTI" ? "MULTI" : "SINGLE"

  return {
    id: coerceNum(o.id) ?? undefined,
    trackState,
    albumOfMemories:
      coerceBool(o.albumOfMemories) || coerceBool(o.album_of_memories),
    soundType: coerceStr(o.soundType) ?? coerceStr(o.sound_type),
    topicId: coerceNum(o.topicId) ?? coerceNum(o.topic_id),
    topicNameCkb:
      coerceStr(o.topicNameCkb) ?? coerceStr(o.topic_name_ckb),
    topicNameKmr:
      coerceStr(o.topicNameKmr) ?? coerceStr(o.topic_name_kmr),
    ckbCoverUrl: coerceStr(o.ckbCoverUrl) ?? coerceStr(o.ckb_cover_url),
    kmrCoverUrl: coerceStr(o.kmrCoverUrl) ?? coerceStr(o.kmr_cover_url),
    hoverCoverUrl: coerceStr(o.hoverCoverUrl) ?? coerceStr(o.hover_cover_url),
    ckbContent: normalizeContent(o.ckbContent ?? o.ckb_content),
    kmrContent: normalizeContent(o.kmrContent ?? o.kmr_content),
    reader: coerceStr(o.reader),
    directors: coerceStringArray(o.directors),
    locations: coerceStringArray(o.locations),
    terms: coerceStr(o.terms),
    thisProjectOfInstitute:
      coerceBool(o.thisProjectOfInstitute) ||
      coerceBool(o.this_project_of_institute),
    contentLanguages: normalizeLanguages(
      o.contentLanguages ?? o.content_languages,
    ),
    tagsCkb:
      tagsFromBilingual.tagsCkb.length > 0
        ? tagsFromBilingual.tagsCkb
        : coerceStringArray(o.tagsCkb ?? o.tags_ckb),
    tagsKmr:
      tagsFromBilingual.tagsKmr.length > 0
        ? tagsFromBilingual.tagsKmr
        : coerceStringArray(o.tagsKmr ?? o.tags_kmr),
    keywordsCkb:
      keywordsFromBilingual.tagsCkb.length > 0
        ? keywordsFromBilingual.tagsCkb
        : coerceStringArray(o.keywordsCkb ?? o.keywords_ckb),
    keywordsKmr:
      keywordsFromBilingual.tagsKmr.length > 0
        ? keywordsFromBilingual.tagsKmr
        : coerceStringArray(o.keywordsKmr ?? o.keywords_kmr),
    files: files.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)),
    attachments: attachments.sort(
      (a, b) => (a.attachmentOrder ?? 0) - (b.attachmentOrder ?? 0),
    ),
    albumName: coerceStr(o.albumName) ?? coerceStr(o.album_name),
    publishmentYear:
      coerceNum(o.publishmentYear) ?? coerceNum(o.publishment_year),
    cdNumber: coerceNum(o.cdNumber) ?? coerceNum(o.cd_number),
    totalTracks: coerceNum(o.totalTracks) ?? coerceNum(o.total_tracks),
    totalDurationSeconds:
      coerceNum(o.totalDurationSeconds) ?? coerceNum(o.total_duration_seconds),
    totalSizeBytes:
      coerceNum(o.totalSizeBytes) ?? coerceNum(o.total_size_bytes),
    createdAt: coerceStr(o.createdAt) ?? coerceStr(o.created_at) ?? undefined,
    updatedAt: coerceStr(o.updatedAt) ?? coerceStr(o.updated_at) ?? undefined,
    createdBy: coerceStr(o.createdBy) ?? coerceStr(o.created_by),
    updatedBy: coerceStr(o.updatedBy) ?? coerceStr(o.updated_by),
  }
}

export function normalizeSoundPage(raw: unknown): SoundPage {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const content = Array.isArray(o.content)
    ? o.content.map(normalizeSoundDto)
    : []
  return {
    content,
    totalElements:
      coerceNum(o.totalElements) ?? coerceNum(o.total_elements) ?? content.length,
    totalPages: coerceNum(o.totalPages) ?? coerceNum(o.total_pages) ?? 1,
    size: coerceNum(o.size) ?? 20,
    number: coerceNum(o.number) ?? 0,
    first: coerceBool(o.first),
    last: coerceBool(o.last),
    empty: coerceBool(o.empty) || content.length === 0,
  }
}

export function normalizeTopicDto(raw: unknown): TopicDto {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  return {
    id: coerceNum(o.id) ?? 0,
    nameCkb: coerceStr(o.nameCkb) ?? coerceStr(o.name_ckb),
    nameKmr: coerceStr(o.nameKmr) ?? coerceStr(o.name_kmr),
    createdAt: coerceStr(o.createdAt) ?? coerceStr(o.created_at) ?? undefined,
    updatedAt: coerceStr(o.updatedAt) ?? coerceStr(o.updated_at) ?? undefined,
  }
}
