"use client"

import { useQuery } from "@tanstack/react-query"

import { projectKeys } from "@/lib/projects-query-keys"
import type { ProjectTypeOption } from "@/types/projects"

export function useProjectsDerivedTypes() {
  return useQuery({
    queryKey: projectKeys.types(),
    queryFn: async () => [] as ProjectTypeOption[],
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    initialData: [],
  })
}
