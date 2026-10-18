"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { newsKeys } from "@/lib/news-query-keys"
import { projectKeys } from "@/lib/projects-query-keys"
import { taxonomyKeys } from "@/lib/taxonomy-query-keys"
import {
  createNewsCategory,
  createNewsSubCategory,
  createProjectType,
  deleteNewsCategory,
  deleteNewsSubCategory,
  deleteProjectType,
  getNewsTaxonomy,
  getProjectTypes,
  updateNewsCategory,
  updateNewsSubCategory,
  updateProjectType,
} from "@/services/taxonomyService"
import type {
  SubCategoryWritePayload,
  TaxonomyWritePayload,
} from "@/types/taxonomy"

/**
 * Managed-taxonomy queries + mutations. Every write invalidates BOTH the
 * admin list (taxonomyKeys) and the option caches the news/project forms
 * read (`newsKeys.all` / `projectKeys.all` cover the derived categories,
 * sub-categories and type pickers), so pickers refresh the moment a managed
 * row changes.
 */
export function useNewsTaxonomyQuery() {
  return useQuery({
    queryKey: taxonomyKeys.newsCategories(),
    queryFn: getNewsTaxonomy,
  })
}

export function useProjectTypesQuery() {
  return useQuery({
    queryKey: taxonomyKeys.projectTypes(),
    queryFn: getProjectTypes,
  })
}

function useInvalidateNewsTaxonomy() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: taxonomyKeys.newsCategories() })
    void queryClient.invalidateQueries({ queryKey: newsKeys.all })
  }
}

function useInvalidateProjectTypes() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: taxonomyKeys.projectTypes() })
    void queryClient.invalidateQueries({ queryKey: projectKeys.all })
  }
}

// ── News categories ──────────────────────────────────────────────────────

export function useCreateNewsCategoryMutation() {
  const invalidate = useInvalidateNewsTaxonomy()
  return useMutation({
    mutationFn: (payload: TaxonomyWritePayload) => createNewsCategory(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateNewsCategoryMutation() {
  const invalidate = useInvalidateNewsTaxonomy()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TaxonomyWritePayload }) =>
      updateNewsCategory(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteNewsCategoryMutation() {
  const invalidate = useInvalidateNewsTaxonomy()
  return useMutation({
    mutationFn: (id: number) => deleteNewsCategory(id),
    onSuccess: invalidate,
  })
}

// ── News sub-categories ──────────────────────────────────────────────────

export function useCreateNewsSubCategoryMutation() {
  const invalidate = useInvalidateNewsTaxonomy()
  return useMutation({
    mutationFn: (payload: SubCategoryWritePayload) =>
      createNewsSubCategory(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateNewsSubCategoryMutation() {
  const invalidate = useInvalidateNewsTaxonomy()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: SubCategoryWritePayload
    }) => updateNewsSubCategory(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteNewsSubCategoryMutation() {
  const invalidate = useInvalidateNewsTaxonomy()
  return useMutation({
    mutationFn: (id: number) => deleteNewsSubCategory(id),
    onSuccess: invalidate,
  })
}

// ── Project types ────────────────────────────────────────────────────────

export function useCreateProjectTypeMutation() {
  const invalidate = useInvalidateProjectTypes()
  return useMutation({
    mutationFn: (payload: TaxonomyWritePayload) => createProjectType(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateProjectTypeMutation() {
  const invalidate = useInvalidateProjectTypes()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TaxonomyWritePayload }) =>
      updateProjectType(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteProjectTypeMutation() {
  const invalidate = useInvalidateProjectTypes()
  return useMutation({
    mutationFn: (id: number) => deleteProjectType(id),
    onSuccess: invalidate,
  })
}
