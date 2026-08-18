import api from "@/lib/axios"
import { normalizeSiteSettingsDto } from "@/lib/site-settings-normalize"
import type { SiteSettingsDto, SiteSettingsPayload } from "@/types/site-settings"

const BASE = "/api/v1/site-settings"

/**
 * Public, and it never 404s — with no row stored the API answers with the
 * defaults, so this always resolves to something renderable.
 */
export async function getSiteSettings(): Promise<SiteSettingsDto> {
  const { data } = await api.get<unknown>(BASE)
  return normalizeSiteSettingsDto(data)
}

/**
 * `PUT` with only the fields being changed. An omitted field leaves the stored
 * value alone and `""` clears it, so an empty body is a legal no-op that
 * returns the current settings.
 */
export async function updateSiteSettings(
  payload: SiteSettingsPayload,
): Promise<SiteSettingsDto> {
  const { data } = await api.put<unknown>(BASE, payload)
  return normalizeSiteSettingsDto(data)
}
