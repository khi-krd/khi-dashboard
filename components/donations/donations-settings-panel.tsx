"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon } from "@heroicons/react/24/outline"
import { useEffect, useMemo, useRef } from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"
import { toast } from "sonner"

import { DonationsErrorState } from "@/components/donations/donations-error-state"
import { NS } from "@/components/donations/donations-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  useDonationSettingsQuery,
  useUpdateDonationSettingsMutation,
} from "@/hooks/useDonations"
import { toastError } from "@/lib/toast"
import {
  defaultDonationSettingsValues,
  donationSettingsSchema,
  formValuesToSettingsPayload,
  settingsDtoToFormValues,
  type DonationSettingsFormValues,
} from "@/lib/validations/donations"
import type { DonationSettingsDto, DonationTypeCode } from "@/types/donations"

const DERIVED_TYPE_CODES: DonationTypeCode[] = ["FINANCIAL", "ARCHIVE"]

export function DonationsSettingsPanel() {
  const settingsQ = useDonationSettingsQuery()
  const updateMut = useUpdateDonationSettingsMutation()

  if (settingsQ.isError) {
    return <DonationsErrorState onRetry={() => void settingsQ.refetch()} />
  }

  return (
    <DonationsSettingsForm
      settingsDto={settingsQ.data ?? undefined}
      isLoading={settingsQ.isLoading}
      pending={updateMut.isPending}
      onSave={(payload) =>
        updateMut.mutate(payload, {
          onSuccess: () => toast.success(NS.settings.saved),
          onError: () => toastError(NS.error.generic),
        })
      }
    />
  )
}

function DonationsSettingsForm({
  settingsDto,
  isLoading,
  pending,
  onSave,
}: {
  settingsDto?: DonationSettingsDto
  isLoading?: boolean
  pending?: boolean
  onSave: (payload: DonationSettingsDto) => void
}) {
  const bootstrapped = useRef(false)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<DonationSettingsFormValues>({
    resolver: zodResolver(donationSettingsSchema) as Resolver<DonationSettingsFormValues>,
    defaultValues: defaultDonationSettingsValues(),
    mode: "onChange",
  })

  useEffect(() => {
    bootstrapped.current = false
  }, [settingsDto?.id])

  useEffect(() => {
    if (bootstrapped.current) return
    if (isLoading) return
    bootstrapped.current = true
    if (settingsDto) {
      reset(settingsDtoToFormValues(settingsDto))
    } else {
      reset(defaultDonationSettingsValues())
    }
  }, [settingsDto, isLoading, reset])

  const financialEnabled = watch("financialDonationsEnabled")
  const archiveEnabled = watch("archiveDonationsEnabled")

  const derivedTypes = useMemo(
    () =>
      DERIVED_TYPE_CODES.map((code) => ({
        code,
        enabled:
          code === "FINANCIAL" ? financialEnabled : archiveEnabled,
      })),
    [financialEnabled, archiveEnabled],
  )

  const canSave = isDirty && !pending

  const onSubmit = handleSubmit((values) => {
    onSave(formValuesToSettingsPayload(values, settingsDto?.id))
    reset(values)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="border-border/60 bg-card/50 space-y-4 rounded-xl border p-5 shadow-xs">
        <div>
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-foreground before:h-4 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">{NS.settings.title}</h2>
          <p className="text-muted-foreground text-sm">{NS.settings.subtitle}</p>
        </div>

        <Controller
          control={control}
          name="heroImageUrl"
          render={({ field, fieldState }) => (
            <MediaCoverUpload
              label={NS.settings.heroImage}
              helperText={NS.settings.heroImageHelper}
              previewUrl={field.value?.trim() || null}
              urlValue={field.value ?? ""}
              onUrlChange={field.onChange}
              urlError={fieldState.error?.message}
              aspectClass="aspect-[21/9]"
            />
          )}
        />
      </section>

      <section className="border-border/60 bg-card/50 space-y-4 rounded-xl border p-5 shadow-xs">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground before:h-3.5 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">{NS.settings.titles}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="titleCkb"
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="titleCkb">{NS.settings.titleCkb}</Label>
                <Input id="titleCkb" {...field} />
              </div>
            )}
          />
          <Controller
            control={control}
            name="titleKmr"
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="titleKmr">{NS.settings.titleKmr}</Label>
                <Input id="titleKmr" {...field} />
              </div>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="descriptionCkb"
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="descriptionCkb">{NS.settings.descriptionCkb}</Label>
                <Textarea id="descriptionCkb" rows={3} {...field} />
              </div>
            )}
          />
          <Controller
            control={control}
            name="descriptionKmr"
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="descriptionKmr">{NS.settings.descriptionKmr}</Label>
                <Textarea id="descriptionKmr" rows={3} {...field} />
              </div>
            )}
          />
        </div>
      </section>

      <section className="border-border/60 bg-card/50 space-y-4 rounded-xl border p-5 shadow-xs">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground before:h-3.5 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">{NS.settings.bank}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="bankName"
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="bankName">{NS.settings.bankName}</Label>
                <Input id="bankName" {...field} />
              </div>
            )}
          />
          <Controller
            control={control}
            name="accountName"
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="accountName">{NS.settings.accountName}</Label>
                <Input id="accountName" {...field} />
              </div>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="accountNumber"
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="accountNumber">{NS.settings.accountNumber}</Label>
                <Input id="accountNumber" dir="ltr" className="font-mono" {...field} />
                <p className="text-muted-foreground text-xs">
                  {NS.settings.accountNumberHelper}
                </p>
              </div>
            )}
          />
          <Controller
            control={control}
            name="iban"
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="iban">{NS.settings.iban}</Label>
                <Input id="iban" dir="ltr" className="font-mono" {...field} />
                <p className="text-muted-foreground text-xs">{NS.settings.ibanHelper}</p>
              </div>
            )}
          />
        </div>
        <Controller
          control={control}
          name="swiftCode"
          render={({ field }) => (
            <div className="space-y-2 sm:max-w-xs">
              <Label htmlFor="swiftCode">{NS.settings.swiftCode}</Label>
              <Input id="swiftCode" dir="ltr" className="font-mono" {...field} />
            </div>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="paymentInstructionsCkb"
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="paymentInstructionsCkb">
                  {NS.settings.paymentInstructionsCkb}
                </Label>
                <Textarea id="paymentInstructionsCkb" rows={3} {...field} />
              </div>
            )}
          />
          <Controller
            control={control}
            name="paymentInstructionsKmr"
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="paymentInstructionsKmr">
                  {NS.settings.paymentInstructionsKmr}
                </Label>
                <Textarea id="paymentInstructionsKmr" rows={3} {...field} />
              </div>
            )}
          />
        </div>
      </section>

      <section className="border-border/60 bg-card/50 space-y-4 rounded-xl border p-5 shadow-xs">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground before:h-3.5 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">{NS.settings.toggles}</h3>
        <Controller
          control={control}
          name="financialDonationsEnabled"
          render={({ field }) => (
            <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">{NS.settings.financialEnabled}</p>
                <p className="text-muted-foreground text-xs">
                  {NS.settings.financialEnabledHelper}
                </p>
              </div>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
        <Controller
          control={control}
          name="archiveDonationsEnabled"
          render={({ field }) => (
            <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">{NS.settings.archiveEnabled}</p>
                <p className="text-muted-foreground text-xs">
                  {NS.settings.archiveEnabledHelper}
                </p>
              </div>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />

        <div className="space-y-3 pt-2">
          <div>
            <h4 className="text-sm font-semibold">{NS.settings.typesTitle}</h4>
            <p className="text-muted-foreground text-xs">{NS.settings.typesSubtitle}</p>
          </div>
          <ul className="space-y-2">
            {derivedTypes.map((t) => (
              <li
                key={t.code}
                className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
              >
                <p className="text-sm font-medium">{t.code}</p>
                <Badge variant={t.enabled ? "secondary" : "outline"}>
                  {t.enabled ? NS.settings.typeEnabled : NS.settings.typeDisabled}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={!canSave || isLoading}>
          {pending ? (
            <Spinner className="me-2 size-4" />
          ) : (
            <CheckIcon className="me-1.5 size-4" />
          )}
          {NS.settings.save}
        </Button>
      </div>
    </form>
  )
}
