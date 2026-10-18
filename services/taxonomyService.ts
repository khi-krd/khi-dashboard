import api from "@/lib/axios"
import { unwrapApiData } from "@/lib/api-unwrap"
import type {
  NewsTaxonomyCategoryDto,
  NewsTaxonomySubCategoryDto,
  ProjectTypeDto,
  SubCategoryWritePayload,
  TaxonomyWritePayload,
} from "@/types/taxonomy"

const NEWS_BASE = "/api/v1/news"
const PROJECT_TYPES = "/api/v1/projects/types"

function str(v: unknown): string {
  return typeof v === "string" ? v : ""
}

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0
}

function normalizeSub(raw: unknown): NewsTaxonomySubCategoryDto {
  const r = (raw ?? {}) as Record<string, unknown>
  return {
    id: num(r.id),
    nameCkb: str(r.nameCkb),
    nameKmr: str(r.nameKmr),
    categoryId: num(r.categoryId),
    newsCount: num(r.newsCount),
  }
}

function normalizeCategory(raw: unknown): NewsTaxonomyCategoryDto {
  const r = (raw ?? {}) as Record<string, unknown>
  return {
    id: num(r.id),
    nameCkb: str(r.nameCkb),
    nameKmr: str(r.nameKmr),
    newsCount: num(r.newsCount),
    subCategories: Array.isArray(r.subCategories)
      ? r.subCategories.map(normalizeSub)
      : [],
  }
}

function normalizeProjectType(raw: unknown): ProjectTypeDto {
  const r = (raw ?? {}) as Record<string, unknown>
  return {
    id: num(r.id),
    nameCkb: str(r.nameCkb),
    nameKmr: str(r.nameKmr),
    projectCount: num(r.projectCount),
  }
}

function asList(data: unknown): unknown[] {
  return Array.isArray(data) ? data : []
}

// ── News categories ──────────────────────────────────────────────────────

export async function getNewsTaxonomy(): Promise<NewsTaxonomyCategoryDto[]> {
  const { data } = await api.get<unknown>(`${NEWS_BASE}/categories`)
  return asList(unwrapApiData(data)).map(normalizeCategory)
}

export async function createNewsCategory(
  payload: TaxonomyWritePayload,
): Promise<NewsTaxonomyCategoryDto> {
  const { data } = await api.post<unknown>(`${NEWS_BASE}/categories`, payload)
  return normalizeCategory(unwrapApiData(data))
}

export async function updateNewsCategory(
  id: number,
  payload: TaxonomyWritePayload,
): Promise<NewsTaxonomyCategoryDto> {
  const { data } = await api.put<unknown>(
    `${NEWS_BASE}/categories/${id}`,
    payload,
  )
  return normalizeCategory(unwrapApiData(data))
}

export async function deleteNewsCategory(id: number): Promise<void> {
  await api.delete(`${NEWS_BASE}/categories/${id}`)
}

// ── News sub-categories ──────────────────────────────────────────────────

export async function createNewsSubCategory(
  payload: SubCategoryWritePayload,
): Promise<NewsTaxonomySubCategoryDto> {
  const { data } = await api.post<unknown>(
    `${NEWS_BASE}/subcategories`,
    payload,
  )
  return normalizeSub(unwrapApiData(data))
}

export async function updateNewsSubCategory(
  id: number,
  payload: SubCategoryWritePayload,
): Promise<NewsTaxonomySubCategoryDto> {
  const { data } = await api.put<unknown>(
    `${NEWS_BASE}/subcategories/${id}`,
    payload,
  )
  return normalizeSub(unwrapApiData(data))
}

export async function deleteNewsSubCategory(id: number): Promise<void> {
  await api.delete(`${NEWS_BASE}/subcategories/${id}`)
}

// ── Project types ────────────────────────────────────────────────────────

export async function getProjectTypes(): Promise<ProjectTypeDto[]> {
  const { data } = await api.get<unknown>(PROJECT_TYPES)
  return asList(unwrapApiData(data)).map(normalizeProjectType)
}

export async function createProjectType(
  payload: TaxonomyWritePayload,
): Promise<ProjectTypeDto> {
  const { data } = await api.post<unknown>(PROJECT_TYPES, payload)
  return normalizeProjectType(unwrapApiData(data))
}

export async function updateProjectType(
  id: number,
  payload: TaxonomyWritePayload,
): Promise<ProjectTypeDto> {
  const { data } = await api.put<unknown>(`${PROJECT_TYPES}/${id}`, payload)
  return normalizeProjectType(unwrapApiData(data))
}

export async function deleteProjectType(id: number): Promise<void> {
  await api.delete(`${PROJECT_TYPES}/${id}`)
}
