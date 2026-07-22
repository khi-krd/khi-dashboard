import api from "@/lib/axios"
import type {
  ServicesPageSettingsDto,
  ServicesPageSettingsResponse,
} from "@/types/services-page"

const BASE = "/api/v1/services/settings"

export async function getServicesPageSettings(): Promise<ServicesPageSettingsResponse> {
  const { data } = await api.get<ServicesPageSettingsResponse>(BASE)
  return data
}

export async function updateServicesPageSettings(
  payload: ServicesPageSettingsDto,
): Promise<ServicesPageSettingsResponse> {
  const { data } = await api.put<ServicesPageSettingsResponse>(BASE, payload)
  return data
}
