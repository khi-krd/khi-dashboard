"use client"

import {
  useMutation,
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type { AboutWritePayload } from "@/lib/about-form-data"
import { aboutKeys } from "@/lib/about-query-keys"
import {
  createAboutPartner,
  createAboutTeamMember,
  createAbout,
  deleteAboutPartner,
  deleteAboutTeamMember,
  deleteAbout,
  getAboutPartners,
  getAboutTeamMembers,
  getAboutById,
  getAboutList,
  updateAboutPartner,
  updateAboutTeamMember,
  updateAbout,
} from "@/services/aboutService"
import type { AboutDto, AboutPage } from "@/types/about"
import type { AboutListQueryKeyParts } from "@/lib/about-query-keys"

export function useAboutListQuery(params: AboutListQueryKeyParts) {
  return useQuery({
    queryKey: aboutKeys.list(params),
    queryFn: () => getAboutList(params.page, params.size),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  })
}

function findInListCaches(
  id: number,
  queryClient: ReturnType<typeof useQueryClient>,
): AboutDto | null {
  const listQueries = queryClient.getQueriesData<AboutPage>({
    queryKey: aboutKeys.lists(),
  })
  for (const [, page] of listQueries) {
    const hit = page?.content?.find((a) => a.id === id)
    if (hit) return hit
  }
  return null
}

async function resolveAboutDetail(
  id: number,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<AboutDto | null> {
  const cached = queryClient.getQueryData<AboutDto>(aboutKeys.detail(id))
  if (cached?.id) return cached

  try {
    const fromApi = await getAboutById(id)
    if (fromApi) return fromApi
  } catch {
    /* detail endpoint may 500 — fall through to list cache / list fetch */
  }

  const fromListCache = findInListCaches(id, queryClient)
  if (fromListCache) return fromListCache

  try {
    const page = await getAboutList(0, 500)
    return page.content.find((a) => a.id === id) ?? null
  } catch {
    return null
  }
}

export function useAboutDetailQuery(id: number) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: aboutKeys.detail(id),
    queryFn: () => resolveAboutDetail(id, queryClient),
    enabled: id > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateAbout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAbout,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: aboutKeys.lists() })
      if (data.id) {
        queryClient.setQueryData(aboutKeys.detail(data.id), data)
      }
    },
  })
}

export function useUpdateAbout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AboutWritePayload }) =>
      updateAbout(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: aboutKeys.lists() })
      if (data.id) {
        queryClient.setQueryData(aboutKeys.detail(data.id), data)
      }
    },
  })
}

export function useDeleteAboutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAbout,
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: aboutKeys.lists() })
      queryClient.removeQueries({ queryKey: aboutKeys.detail(id) })
    },
  })
}

export function useAboutTeamMembersQuery() {
  return useQuery({
    queryKey: aboutKeys.team(),
    queryFn: getAboutTeamMembers,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateAboutTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAboutTeamMember,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aboutKeys.team() })
    },
  })
}

export function useUpdateAboutTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateAboutTeamMember>[1] }) =>
      updateAboutTeamMember(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aboutKeys.team() })
    },
  })
}

export function useDeleteAboutTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAboutTeamMember,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aboutKeys.team() })
    },
  })
}

export function useAboutPartnersQuery() {
  return useQuery({
    queryKey: aboutKeys.partners(),
    queryFn: getAboutPartners,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateAboutPartner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAboutPartner,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aboutKeys.partners() })
    },
  })
}

export function useUpdateAboutPartner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateAboutPartner>[1] }) =>
      updateAboutPartner(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aboutKeys.partners() })
    },
  })
}

export function useDeleteAboutPartner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAboutPartner,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aboutKeys.partners() })
    },
  })
}
