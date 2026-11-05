import api from "@/lib/axios"
import { unwrapApiData } from "@/lib/api-unwrap"
import type { DonationArchiveVideoWritePayload } from "@/lib/donation-archive-video-form-data"
import {
  normalizeDonationArchiveVideo,
  normalizeDonationArchiveVideoList,
} from "@/lib/donation-archive-video-normalize"
import type { DonationArchiveVideoDto } from "@/types/donation-archive-video"

const BASE = "/api/v1/donations/archive-videos"

/**
 * The dashboard always asks for `includeInactive` so hidden rows stay editable
 * — without it a video switched off disappears from the list and can never be
 * switched back on. The website calls the same endpoint without it and gets
 * only active videos.
 */
export async function getDonationArchiveVideos(
  includeInactive = true,
): Promise<DonationArchiveVideoDto[]> {
  const { data } = await api.get<unknown>(BASE, {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  return normalizeDonationArchiveVideoList(unwrapApiData(data))
}

export async function createDonationArchiveVideo(
  payload: DonationArchiveVideoWritePayload,
): Promise<DonationArchiveVideoDto | null> {
  const { data } = await api.post<unknown>(BASE, payload)
  return normalizeDonationArchiveVideo(unwrapApiData(data))
}

/** A full replace, not a patch — send every field back, not only the changed one. */
export async function updateDonationArchiveVideo(
  id: number,
  payload: DonationArchiveVideoWritePayload,
): Promise<DonationArchiveVideoDto | null> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, payload)
  return normalizeDonationArchiveVideo(unwrapApiData(data))
}

export async function deleteDonationArchiveVideo(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
