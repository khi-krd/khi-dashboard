import api from "@/lib/axios"
import { unwrapApiData } from "@/lib/api-unwrap"
import {
  normalizeNavMenuItem,
  normalizeNavMenuList,
} from "@/lib/nav-menu-normalize"
import type { NavMenuItemDto } from "@/types/nav-menu"
import type { NavMenuImageWritePayload } from "@/lib/nav-menu-form-data"

const BASE = "/api/v1/nav-menu"

/**
 * The dashboard always asks for `includeInactive` so hidden rows stay visible;
 * the website calls the same endpoint without it and gets only active rows.
 */
export async function getNavMenu(
  includeInactive = true,
): Promise<NavMenuItemDto[]> {
  const { data } = await api.get<unknown>(BASE, {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  return normalizeNavMenuList(unwrapApiData(data))
}

/**
 * Image-only update — the backend ignores every field except `imageUrl`
 * (null clears the photo), so the payload cannot clobber labels or hrefs.
 */
export async function updateNavMenuItem(
  id: number,
  payload: NavMenuImageWritePayload,
): Promise<NavMenuItemDto | null> {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, payload)
  return normalizeNavMenuItem(unwrapApiData(data))
}
