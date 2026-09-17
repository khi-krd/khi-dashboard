import api from "@/lib/axios"
import { unwrapApiData } from "@/lib/api-unwrap"
import type { SiteFontDto, SiteFontPayload } from "@/types/site-fonts"

const BASE = "/api/v1/site-fonts"

function normalizeFont(raw: unknown): SiteFontDto | null {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  if (typeof o.id !== "number" || typeof o.url !== "string") return null
  const language = o.language === "KMR" ? "KMR" : "CKB"
  return {
    id: o.id,
    language,
    name: typeof o.name === "string" ? o.name : "",
    url: o.url,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : null,
  }
}

export async function getSiteFonts(): Promise<SiteFontDto[]> {
  const { data } = await api.get<unknown>(BASE)
  const unwrapped = unwrapApiData<unknown>(data)
  if (!Array.isArray(unwrapped)) return []
  return unwrapped
    .map(normalizeFont)
    .filter((f): f is SiteFontDto => f !== null)
}

export async function createSiteFont(
  payload: SiteFontPayload,
): Promise<SiteFontDto> {
  const { data } = await api.post<unknown>(BASE, payload)
  const font = normalizeFont(unwrapApiData<unknown>(data))
  if (!font) throw new Error("Site font create failed")
  return font
}

export async function deleteSiteFont(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
