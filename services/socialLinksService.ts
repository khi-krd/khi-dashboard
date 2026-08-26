import api from "@/lib/axios"
import { unwrapApiData } from "@/lib/api-unwrap"
import type { SocialLinkWritePayload } from "@/lib/social-links-form-data"
import {
  normalizeSocialLink,
  normalizeSocialLinkList,
} from "@/lib/social-links-normalize"
import type { SocialLinkDto } from "@/types/social-links"

const BASE = "/api/v1/settings/social"

/**
 * The dashboard always asks for `includeInactive` so hidden rows stay editable
 * — without it a link switched off disappears from the list and can never be
 * switched back on (§1). The website calls the same endpoint without it and
 * gets only active rows.
 */
export async function getSocialLinks(
  includeInactive = true,
): Promise<SocialLinkDto[]> {
  const { data } = await api.get<unknown>(BASE, {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  return normalizeSocialLinkList(unwrapApiData(data))
}

export async function createSocialLink(
  payload: SocialLinkWritePayload,
): Promise<SocialLinkDto | null> {
  const { data } = await api.post<unknown>(BASE, payload)
  return normalizeSocialLink(unwrapApiData(data))
}

/** A full replace, not a patch — send every field back, not only the changed one (§4). */
export async function updateSocialLink(
  id: number,
  payload: SocialLinkWritePayload,
): Promise<SocialLinkDto | null> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, payload)
  return normalizeSocialLink(unwrapApiData(data))
}

export async function deleteSocialLink(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
