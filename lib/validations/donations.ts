import { z } from "zod"

import type { DonationSettingsDto } from "@/types/donations"

export const donationSettingsSchema = z.object({
  titleCkb: z.string().max(300).optional().or(z.literal("")),
  titleKmr: z.string().max(300).optional().or(z.literal("")),
  descriptionCkb: z.string().max(5000).optional().or(z.literal("")),
  descriptionKmr: z.string().max(5000).optional().or(z.literal("")),
  heroImageUrl: z.string().max(1500).optional().or(z.literal("")),
  bankName: z.string().max(200).optional().or(z.literal("")),
  accountName: z.string().max(200).optional().or(z.literal("")),
  accountNumber: z.string().max(100).optional().or(z.literal("")),
  iban: z.string().max(100).optional().or(z.literal("")),
  swiftCode: z.string().max(50).optional().or(z.literal("")),
  paymentInstructionsCkb: z.string().max(5000).optional().or(z.literal("")),
  paymentInstructionsKmr: z.string().max(5000).optional().or(z.literal("")),
  financialDonationsEnabled: z.boolean(),
  archiveDonationsEnabled: z.boolean(),
})

export type DonationSettingsFormValues = z.infer<typeof donationSettingsSchema>

export function defaultDonationSettingsValues(): DonationSettingsFormValues {
  return {
    titleCkb: "",
    titleKmr: "",
    descriptionCkb: "",
    descriptionKmr: "",
    heroImageUrl: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    iban: "",
    swiftCode: "",
    paymentInstructionsCkb: "",
    paymentInstructionsKmr: "",
    financialDonationsEnabled: true,
    archiveDonationsEnabled: true,
  }
}

export function settingsDtoToFormValues(
  dto: DonationSettingsDto,
): DonationSettingsFormValues {
  return {
    titleCkb: dto.titleCkb ?? "",
    titleKmr: dto.titleKmr ?? "",
    descriptionCkb: dto.descriptionCkb ?? "",
    descriptionKmr: dto.descriptionKmr ?? "",
    heroImageUrl: dto.heroImageUrl ?? "",
    bankName: dto.bankName ?? "",
    accountName: dto.accountName ?? "",
    accountNumber: dto.accountNumber ?? "",
    iban: dto.iban ?? "",
    swiftCode: dto.swiftCode ?? "",
    paymentInstructionsCkb: dto.paymentInstructionsCkb ?? "",
    paymentInstructionsKmr: dto.paymentInstructionsKmr ?? "",
    financialDonationsEnabled: dto.financialDonationsEnabled ?? true,
    archiveDonationsEnabled: dto.archiveDonationsEnabled ?? true,
  }
}

export function formValuesToSettingsPayload(
  values: DonationSettingsFormValues,
  id?: number,
): DonationSettingsDto {
  const trim = (v: string | undefined) => v?.trim() || null
  return {
    ...(typeof id === "number" ? { id } : {}),
    titleCkb: trim(values.titleCkb),
    titleKmr: trim(values.titleKmr),
    descriptionCkb: trim(values.descriptionCkb),
    descriptionKmr: trim(values.descriptionKmr),
    heroImageUrl: trim(values.heroImageUrl),
    bankName: trim(values.bankName),
    accountName: trim(values.accountName),
    accountNumber: trim(values.accountNumber),
    iban: trim(values.iban),
    swiftCode: trim(values.swiftCode),
    paymentInstructionsCkb: trim(values.paymentInstructionsCkb),
    paymentInstructionsKmr: trim(values.paymentInstructionsKmr),
    financialDonationsEnabled: values.financialDonationsEnabled,
    archiveDonationsEnabled: values.archiveDonationsEnabled,
  }
}
