import api from "@/lib/axios"
import type { ContactWritePayload } from "@/lib/contact-form-data"
import {
  normalizeContactDto,
  normalizeContactPage,
} from "@/lib/contact-normalize"
import { unwrapApiData } from "@/lib/about-normalize"
import type { ContactDto, ContactPage } from "@/types/contact"

const BASE = "/api/v1/contact"

export async function getContactListAdmin(
  page: number,
  size: number,
): Promise<ContactPage> {
  const { data } = await api.get<unknown>(BASE, { params: { page, size } })
  return normalizeContactPage(data)
}

export async function getContactListActive(
  page: number,
  size: number,
): Promise<ContactPage> {
  const { data } = await api.get<unknown>(`${BASE}/active`, {
    params: { page, size },
  })
  return normalizeContactPage(data)
}

export async function getContactById(id: number): Promise<ContactDto | null> {
  try {
    const { data } = await api.get<unknown>(`${BASE}/${id}`)
    const dto = normalizeContactDto(unwrapApiData(data))
    return dto.id ? dto : null
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404) return null
    throw err
  }
}

export async function getContactBySlug(slug: string): Promise<ContactDto | null> {
  try {
    const { data } = await api.get<unknown>(
      `${BASE}/slug/${encodeURIComponent(slug)}`,
    )
    const dto = normalizeContactDto(unwrapApiData(data))
    return dto.id ? dto : null
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404) return null
    throw err
  }
}

export async function createContact(
  payload: ContactWritePayload,
): Promise<ContactDto> {
  const { data } = await api.post<unknown>(BASE, payload, {
    headers: { "Content-Type": "application/json" },
  })
  return normalizeContactDto(unwrapApiData(data))
}

export async function updateContact(
  id: number,
  payload: ContactWritePayload,
): Promise<ContactDto> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  })
  return normalizeContactDto(unwrapApiData(data))
}

export async function deleteContact(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
