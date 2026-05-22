"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  bulkDeleteServices,
  createService,
  deleteService,
  getServiceById,
  getServicesList,
  getServiceTypes,
  searchServicesAdmin,
  toggleServiceActive,
  updateService,
  uploadServiceFiles,
} from "@/services/servicesService"
import { servicesKeys } from "@/lib/services-query-keys"
import type {
  ServiceListResponse,
  ServiceSingleResponse,
} from "@/types/services"
import type { ServicesListQueryKeyParts } from "@/types/services-ui"

async function fetchServicesPage(
  params: ServicesListQueryKeyParts,
): Promise<ServiceListResponse> {
  const kw = params.keyword.trim()
  if (kw.length >= 2) {
    return searchServicesAdmin(kw, params.page, params.size)
  }
  return getServicesList(params.page, params.size)
}

export function useServicesListQuery(params: ServicesListQueryKeyParts) {
  return useQuery({
    queryKey: servicesKeys.list(params),
    queryFn: () => fetchServicesPage(params),
    staleTime: 1000 * 60 * 2,
  })
}

async function resolveServiceDetail(
  id: number,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<ServiceSingleResponse> {
  const cached = queryClient.getQueryData<ServiceSingleResponse>(
    servicesKeys.detail(id),
  )
  if (cached?.success && cached.data) return cached

  const fromApi = await getServiceById(id)
  if (fromApi?.success && fromApi.data) return fromApi

  const listQueries = queryClient.getQueriesData<ServiceListResponse>({
    queryKey: servicesKeys.lists(),
  })
  for (const [, data] of listQueries) {
    const hit = data?.data?.content?.find((s) => s.id === id)
    if (hit) {
      return { success: true, message: "", data: hit }
    }
  }

  const page = await getServicesList(0, 500)
  const found = page.data?.content?.find((s) => s.id === id)
  if (found) {
    return { success: true, message: "", data: found }
  }

  return { success: false, message: "not_found" }
}

export function useServiceDetailQuery(id: number) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: servicesKeys.detail(id),
    queryFn: () => resolveServiceDetail(id, queryClient),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useServiceTypesQuery() {
  return useQuery({
    queryKey: servicesKeys.types(),
    queryFn: getServiceTypes,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: unknown) => createService(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: servicesKeys.lists() })
    },
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: number; payload: unknown }) =>
      updateService(variables.id, variables.payload),
    onSuccess: (res, variables) => {
      if (res.success && res.data?.id === variables.id) {
        queryClient.setQueryData(servicesKeys.detail(variables.id), res)
      }
      void queryClient.invalidateQueries({ queryKey: servicesKeys.lists() })
    },
  })
}

export function useDeleteServiceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteService(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: servicesKeys.lists() })
      const snapshots = queryClient.getQueriesData<ServiceListResponse>({
        queryKey: servicesKeys.lists(),
      })
      for (const [key, data] of snapshots) {
        if (!data?.data?.content) continue
        queryClient.setQueryData(key, {
          ...data,
          data: {
            ...data.data,
            content: data.data.content.filter((s) => s.id !== id),
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
      void queryClient.invalidateQueries({ queryKey: servicesKeys.lists() })
      void queryClient.removeQueries({ queryKey: servicesKeys.detail(id) })
    },
  })
}

export function useBulkDeleteServicesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => bulkDeleteServices(ids),
    onSuccess: (_void, ids) => {
      void queryClient.invalidateQueries({ queryKey: servicesKeys.lists() })
      for (const id of ids) {
        void queryClient.removeQueries({ queryKey: servicesKeys.detail(id) })
      }
    },
  })
}

export function useToggleServiceActiveMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) =>
      toggleServiceActive(id, value),
    onMutate: async ({ id, value }) => {
      await queryClient.cancelQueries({ queryKey: servicesKeys.detail(id) })
      const prevDetail = queryClient.getQueryData<ServiceSingleResponse>(
        servicesKeys.detail(id),
      )
      if (prevDetail?.data) {
        queryClient.setQueryData(servicesKeys.detail(id), {
          ...prevDetail,
          data: { ...prevDetail.data, active: value },
        })
      }
      const listSnapshots = queryClient.getQueriesData<ServiceListResponse>({
        queryKey: servicesKeys.lists(),
      })
      for (const [key, data] of listSnapshots) {
        if (!data?.data?.content) continue
        queryClient.setQueryData(key, {
          ...data,
          data: {
            ...data.data,
            content: data.data.content.map((s) =>
              s.id === id ? { ...s, active: value } : s,
            ),
          },
        })
      }
      return { prevDetail, listSnapshots }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevDetail) {
        queryClient.setQueryData(
          servicesKeys.detail(_vars.id),
          ctx.prevDetail,
        )
      }
      for (const [key, data] of ctx?.listSnapshots ?? []) {
        queryClient.setQueryData(key, data)
      }
    },
    onSuccess: (res, { id }) => {
      if (res.success && res.data) {
        queryClient.setQueryData(servicesKeys.detail(id), res)
      }
      void queryClient.invalidateQueries({ queryKey: servicesKeys.lists() })
    },
  })
}

export function useUploadServiceFilesMutation() {
  return useMutation({
    mutationFn: (files: File[]) => uploadServiceFiles(files),
  })
}
