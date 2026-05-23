"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type { ContactWritePayload } from "@/lib/contact-form-data"
import { contactKeys, type ContactListQueryKeyParts } from "@/lib/contact-query-keys"
import {
  createContact,
  deleteContact,
  getContactById,
  getContactListAdmin,
  updateContact,
} from "@/services/contactService"
import type { ContactDto, ContactPage } from "@/types/contact"

export function useContactListQuery(params: ContactListQueryKeyParts) {
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => getContactListAdmin(params.page, params.size),
    staleTime: 1000 * 60 * 2,
  })
}

function findInListCaches(
  id: number,
  queryClient: ReturnType<typeof useQueryClient>,
): ContactDto | null {
  const listQueries = queryClient.getQueriesData<ContactPage>({
    queryKey: contactKeys.lists(),
  })
  for (const [, page] of listQueries) {
    const hit = page?.content?.find((c) => c.id === id)
    if (hit) return hit
  }
  return null
}

async function resolveContactDetail(
  id: number,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<ContactDto | null> {
  const cached = queryClient.getQueryData<ContactDto>(contactKeys.detail(id))
  if (cached?.id) return cached

  const fromApi = await getContactById(id)
  if (fromApi) return fromApi

  return findInListCaches(id, queryClient)
}

export function useContactDetailQuery(id: number) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => resolveContactDetail(id, queryClient),
    enabled: id > 0,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createContact,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      if (data.id) {
        queryClient.setQueryData(contactKeys.detail(data.id), data)
      }
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ContactWritePayload }) =>
      updateContact(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      if (data.id) {
        queryClient.setQueryData(contactKeys.detail(data.id), data)
      }
    },
  })
}

export function useDeleteContactMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteContact,
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.removeQueries({ queryKey: contactKeys.detail(id) })
    },
  })
}
