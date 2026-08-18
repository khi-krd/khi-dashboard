import { unwrapApiData } from "@/lib/api-unwrap"
import type { ReklamVideoDto } from "@/types/reklam-video"

function coerceStr(v: unknown): string | null {
  if (typeof v !== "string") return null
  const trimmed = v.trim()
  return trimmed ? trimmed : null
}

function coerceNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim()) {
    const parsed = Number(v)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/** Accepts both camelCase and snake_case, as the rest of the normalizers do. */
export function normalizeReklamVideoDto(raw: unknown): ReklamVideoDto {
  const unwrapped = unwrapApiData<unknown>(raw)
  const o = (unwrapped && typeof unwrapped === "object" ? unwrapped : {}) as Record<
    string,
    unknown
  >
  return {
    id: coerceNum(o.id) ?? 0,
    videoUrl: coerceStr(o.videoUrl) ?? coerceStr(o.video_url) ?? "",
    sizeBytes: coerceNum(o.sizeBytes) ?? coerceNum(o.size_bytes),
    mimeType: coerceStr(o.mimeType) ?? coerceStr(o.mime_type),
    createdAt: coerceStr(o.createdAt) ?? coerceStr(o.created_at),
    updatedAt: coerceStr(o.updatedAt) ?? coerceStr(o.updated_at),
  }
}
