import api from "@/lib/axios"
import { unwrapApiData } from "@/lib/api-unwrap"
import type { DonationTypeCardWritePayload } from "@/lib/donation-type-card-form-data"
import {
  normalizeDonationTypeCard,
  normalizeDonationTypeCardList,
} from "@/lib/donation-type-card-normalize"
import type { DonationTypeCardDto } from "@/types/donation-type-card"

const BASE = "/api/v1/donations/type-cards"

/**
 * The dashboard always asks for `includeInactive` so hidden rows stay editable
 * — without it a card switched off disappears from the list and can never be
 * switched back on. The website calls the same endpoint without it and gets
 * only active cards.
 */
export async function getDonationTypeCards(
  includeInactive = true,
): Promise<DonationTypeCardDto[]> {
  const { data } = await api.get<unknown>(BASE, {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  return normalizeDonationTypeCardList(unwrapApiData(data))
}

export async function createDonationTypeCard(
  payload: DonationTypeCardWritePayload,
): Promise<DonationTypeCardDto | null> {
  const { data } = await api.post<unknown>(BASE, payload)
  return normalizeDonationTypeCard(unwrapApiData(data))
}

/** A full replace, not a patch — send every field back, not only the changed one. */
export async function updateDonationTypeCard(
  id: number,
  payload: DonationTypeCardWritePayload,
): Promise<DonationTypeCardDto | null> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, payload)
  return normalizeDonationTypeCard(unwrapApiData(data))
}

export async function deleteDonationTypeCard(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
