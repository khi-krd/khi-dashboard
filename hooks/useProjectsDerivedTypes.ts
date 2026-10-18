"use client"

import { useQuery } from "@tanstack/react-query"

import { projectKeys } from "@/lib/projects-query-keys"
import { getProjectTypes } from "@/services/taxonomyService"
import type { ProjectTypeOption } from "@/types/projects"

/**
 * Type options for the project form picker — sourced from the managed
 * vocabulary (/api/v1/projects/types). The cache key is shared with
 * `mergeProjectsDerivedTypes` / `pushInlineProjectType`, which union names
 * seen on loaded project rows or typed inline into the same list.
 */
export function useProjectsDerivedTypes() {
  return useQuery({
    queryKey: projectKeys.types(),
    queryFn: async (): Promise<ProjectTypeOption[]> => {
      const types = await getProjectTypes()
      return types.map((t) => ({
        projectTypeCkb: t.nameCkb,
        projectTypeKmr: t.nameKmr,
      }))
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  })
}
