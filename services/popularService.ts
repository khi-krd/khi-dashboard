import api from "@/lib/axios"

export type PopularEntity =
  | "news"
  | "projects"
  | "videos"
  | "sounds"
  | "writings"
  | "collections"

export type PopularIdsResponse = Record<PopularEntity, number[]>

const BASE = "/api/v1/popular"

export async function getPopularIds(): Promise<PopularIdsResponse> {
  const { data } = await api.get<PopularIdsResponse>(`${BASE}/ids`)
  return data
}

export async function setPopular(
  entity: PopularEntity,
  id: number,
  isPopular: boolean,
): Promise<void> {
  await api.patch(`${BASE}/${entity}/${id}`, { isPopular })
}
