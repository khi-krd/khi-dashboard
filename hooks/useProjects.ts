"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectsList,
  searchProjectsByKeyword,
  searchProjectsByTag,
  updateProject,
} from "@/services/projectsService"
import { projectKeys } from "@/lib/projects-query-keys"
import type { ProjectListResponse, ProjectSingleResponse } from "@/types/projects"
import type { ProjectsListQueryKeyParts } from "@/types/projects-ui"

async function fetchProjectsPage(
  params: ProjectsListQueryKeyParts,
): Promise<ProjectListResponse> {
  const kw = params.keyword.trim()
  if (kw.length >= 2) {
    if (params.searchMode === "tag") {
      return searchProjectsByTag(kw, params.page, params.size)
    }
    if (params.searchMode === "keyword") {
      return searchProjectsByKeyword(kw, params.page, params.size)
    }
    try {
      const byTag = await searchProjectsByTag(kw, params.page, params.size)
      if (byTag.success && (byTag.data?.content?.length ?? 0) > 0) {
        return byTag
      }
    } catch {
      /* fall through */
    }
    return searchProjectsByKeyword(kw, params.page, params.size)
  }
  return getProjectsList(params.page, params.size)
}

export function useProjectsListQuery(params: ProjectsListQueryKeyParts) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => fetchProjectsPage(params),
    staleTime: 1000 * 60 * 2,
  })
}

async function resolveProjectDetail(
  id: number,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<ProjectSingleResponse> {
  const cached = queryClient.getQueryData<ProjectSingleResponse>(
    projectKeys.detail(id),
  )
  if (cached?.success && cached.data) return cached

  const fromApi = await getProjectById(id)
  if (fromApi?.success && fromApi.data) return fromApi

  const listQueries = queryClient.getQueriesData<ProjectListResponse>({
    queryKey: projectKeys.lists(),
  })
  for (const [, data] of listQueries) {
    const hit = data?.data?.content?.find((p) => p.id === id)
    if (hit) {
      return { success: true, message: "", data: hit }
    }
  }

  const page = await getProjectsList(0, 500)
  const found = page.data?.content?.find((p) => p.id === id)
  if (found) {
    return { success: true, message: "", data: found }
  }

  return { success: false, message: "not_found" }
}

export function useProjectDetailQuery(id: number) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => resolveProjectDetail(id, queryClient),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => createProject(formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: number; formData: FormData }) =>
      updateProject(variables.id, variables.formData),
    onSuccess: (res, variables) => {
      if (res.success && res.data?.id === variables.id) {
        queryClient.setQueryData(projectKeys.detail(variables.id), res)
      }
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() })
      const snapshots = queryClient.getQueriesData<ProjectListResponse>({
        queryKey: projectKeys.lists(),
      })
      for (const [key, data] of snapshots) {
        if (!data?.data?.content) continue
        queryClient.setQueryData(key, {
          ...data,
          data: {
            ...data.data,
            content: data.data.content.filter((p) => p.id !== id),
            totalElements: Math.max(0, (data.data.totalElements ?? 1) - 1),
          },
        })
      }
      return { snapshots }
    },
    onError: (_err, _id, ctx) => {
      for (const [key, data] of ctx?.snapshots ?? []) {
        queryClient.setQueryData(key, data)
      }
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      void queryClient.removeQueries({ queryKey: projectKeys.detail(id) })
    },
  })
}
