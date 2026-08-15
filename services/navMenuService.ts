import api from "@/lib/axios"
import { unwrapApiData } from "@/lib/api-unwrap"
import {
  normalizeNavMenuItem,
  normalizeNavMenuList,
} from "@/lib/nav-menu-normalize"
import type { NavMenuItemDto } from "@/types/nav-menu"
import type { NavMenuWritePayload } from "@/lib/nav-menu-form-data"

const BASE = "/api/v1/nav-menu"

/**
 * The dashboard always asks for `includeInactive` so hidden rows stay editable;
 * the website calls the same endpoint without it and gets only active rows,
 * links included (§3.3).
 */
export async function getNavMenu(
  includeInactive = true,
): Promise<NavMenuItemDto[]> {
  const { data } = await api.get<unknown>(BASE, {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  return normalizeNavMenuList(unwrapApiData(data))
}

export async function getNavMenuItem(
  id: number,
): Promise<NavMenuItemDto | null> {
  try {
    const { data } = await api.get<unknown>(`${BASE}/${id}`)
    return normalizeNavMenuItem(unwrapApiData(data))
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404) return null
    throw err
  }
}

export async function createNavMenuItem(
  payload: NavMenuWritePayload,
): Promise<NavMenuItemDto | null> {
  const { data } = await api.post<unknown>(BASE, payload)
  return normalizeNavMenuItem(unwrapApiData(data))
}

/**
 * A full replace, not a patch: any field left out is reset to its default, so
 * the caller must send the whole object back (§3.4). `links` is the exception —
 * omitting it leaves the existing set alone, `[]` clears it.
 */
export async function updateNavMenuItem(
  id: number,
  payload: NavMenuWritePayload,
): Promise<NavMenuItemDto | null> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, payload)
  return normalizeNavMenuItem(unwrapApiData(data))
}

export async function deleteNavMenuItem(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
