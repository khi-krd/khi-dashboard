"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { contactKeys } from "@/lib/contact-query-keys"
import { newsKeys } from "@/lib/news-query-keys"
import { projectKeys } from "@/lib/projects-query-keys"
import { soundKeys } from "@/lib/sounds-query-keys"
import { taxonomyKeys } from "@/lib/taxonomy-query-keys"
import {
  createNewsCategory,
  createNewsSubCategory,
  createOfficeType,
  createProjectType,
  createSoundType,
  deleteNewsCategory,
  deleteNewsSubCategory,
  deleteOfficeType,
  deleteProjectType,
  deleteSoundType,
  getNewsTaxonomy,
  getOfficeTypes,
  getProjectTypes,
  getSoundTypes,
  updateNewsCategory,
  updateNewsSubCategory,
  updateOfficeType,
  updateProjectType,
  updateSoundType,
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

export function useSoundTypesQuery() {
  return useQuery({
    queryKey: taxonomyKeys.soundTypes(),
    queryFn: getSoundTypes,
  })
}

export function useOfficeTypesQuery() {
  return useQuery({
    queryKey: taxonomyKeys.officeTypes(),
    queryFn: getOfficeTypes,
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

function useInvalidateSoundTypes() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: taxonomyKeys.soundTypes() })
    void queryClient.invalidateQueries({ queryKey: soundKeys.all })
  }
}

function useInvalidateOfficeTypes() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: taxonomyKeys.officeTypes() })
    void queryClient.invalidateQueries({ queryKey: contactKeys.all })
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

// ── Sound types ──────────────────────────────────────────────────────────

export function useCreateSoundTypeMutation() {
  const invalidate = useInvalidateSoundTypes()
  return useMutation({
    mutationFn: (payload: TaxonomyWritePayload) => createSoundType(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateSoundTypeMutation() {
  const invalidate = useInvalidateSoundTypes()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TaxonomyWritePayload }) =>
      updateSoundType(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteSoundTypeMutation() {
  const invalidate = useInvalidateSoundTypes()
  return useMutation({
    mutationFn: (id: number) => deleteSoundType(id),
    onSuccess: invalidate,
  })
}

// ── Office types ─────────────────────────────────────────────────────────

export function useCreateOfficeTypeMutation() {
  const invalidate = useInvalidateOfficeTypes()
  return useMutation({
    mutationFn: (payload: TaxonomyWritePayload) => createOfficeType(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateOfficeTypeMutation() {
  const invalidate = useInvalidateOfficeTypes()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TaxonomyWritePayload }) =>
      updateOfficeType(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteOfficeTypeMutation() {
  const invalidate = useInvalidateOfficeTypes()
  return useMutation({
    mutationFn: (id: number) => deleteOfficeType(id),
    onSuccess: invalidate,
  })
}
