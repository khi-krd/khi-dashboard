"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  donationKeys,
  type DonationListQueryKeyParts,
} from "@/lib/donations-query-keys"
import {
  getArchiveDonationsList,
  getDonationSettings,
  getDonationTypes,
  getFinancialDonationsList,
  updateArchiveDonationStatus,
  updateDonationSettings,
  updateFinancialDonationStatus,
} from "@/services/donationsService"
import type {
  DonationPage,
  DonationSettingsDto,
  DonationStatus,
} from "@/types/donations"

export function useDonationSettingsQuery() {
  return useQuery({
    queryKey: donationKeys.settings(),
    queryFn: getDonationSettings,
    staleTime: 1000 * 60 * 2,
  })
}

export function useDonationTypesQuery() {
  return useQuery({
    queryKey: donationKeys.types(),
    queryFn: getDonationTypes,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUpdateDonationSettingsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateDonationSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(donationKeys.settings(), data)
      void queryClient.invalidateQueries({ queryKey: donationKeys.types() })
    },
  })
}

export function useArchiveDonationsListQuery(params: DonationListQueryKeyParts) {
  return useQuery({
    queryKey: donationKeys.archiveList(params),
    queryFn: () => getArchiveDonationsList(params.page, params.size),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  })
}

export function useUpdateArchiveDonationStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: DonationStatus }) =>
      updateArchiveDonationStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: donationKeys.archiveLists() })
    },
  })
}

export function useFinancialDonationsListQuery(params: DonationListQueryKeyParts) {
  return useQuery({
    queryKey: donationKeys.financialList(params),
    queryFn: () => getFinancialDonationsList(params.page, params.size),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  })
}

export function useUpdateFinancialDonationStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: DonationStatus }) =>
      updateFinancialDonationStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: donationKeys.financialLists() })
    },
  })
}

export type { DonationPage, DonationSettingsDto }
