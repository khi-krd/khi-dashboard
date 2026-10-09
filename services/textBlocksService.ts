import api from "@/lib/axios"

export interface TextBlockValue {
  id: number
  value: string
  updatedAt: string | null
  updatedBy: string | null
}

export interface TextBlockRow {
  key: string
  section: string | null
  values: Record<string, TextBlockValue>
}

const BASE = "/api/v1/text-blocks"

export async function getTextBlocks(): Promise<TextBlockRow[]> {
  const { data } = await api.get<TextBlockRow[]>(`${BASE}/all`)
  return Array.isArray(data) ? data : []
}

export async function saveTextBlocks(
  entries: { key: string; locale: string; value: string }[],
): Promise<number> {
  const { data } = await api.put<{ data?: { saved?: number } }>(BASE, {
    entries,
  })
  return data?.data?.saved ?? entries.length
}

export async function deleteTextBlock(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
