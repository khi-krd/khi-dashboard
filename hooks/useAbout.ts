"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { aboutKeys } from "@/lib/about-query-keys"
import {
  createAbout,
  deleteAbout,
  getAboutById,
  getAboutList,
  updateAbout,
} from "@/services/aboutService"
import type { AboutDto, AboutPage } from "@/types/about"
import type { AboutListQueryKeyParts } from "@/lib/about-query-keys"

export function useAboutListQuery(params: AboutListQueryKeyParts) {
  return useQuery({
    queryKey: aboutKeys.list(params),
    queryFn: () => getAboutList(params.page, params.size),
    staleTime: 1000 * 60 * 2,
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
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      updateAbout(id, formData),
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
