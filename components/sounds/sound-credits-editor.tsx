"use client"

import { Controller, useFormContext } from "react-hook-form"

import { SoundTagInput } from "@/components/sounds/sound-tag-input"
import { NS } from "@/components/sounds/sounds-strings"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { SoundFormValues } from "@/lib/validations/sounds"

const sectionDivider =
  "mt-6 border-t border-border/60 pt-6 [&:first-child]:mt-0 [&:first-child]:border-t-0 [&:first-child]:pt-0"

export function SoundCreditsEditor() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<SoundFormValues>()

  return (
    <section className={sectionDivider}>
      <h2 className="mb-4 text-sm font-medium">{NS.section.credits}</h2>
      <div className="space-y-4">
        <div className="space-y-1">
          <Label className="text-xs">{NS.credits.reader}</Label>
          <Input
            {...register("reader")}
            placeholder={NS.field.reader_placeholder}
            className="h-9"
            maxLength={255}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{NS.credits.directors}</Label>
          <Controller
            name="directors"
            control={control}
            render={({ field }) => (
              <SoundTagInput
                value={field.value}
                onChange={field.onChange}
                placeholder={NS.field.directors_placeholder}
                variant="solid"
              />
            )}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{NS.credits.locations}</Label>
          <Controller
            name="locations"
            control={control}
            render={({ field }) => (
              <SoundTagInput
                value={field.value}
                onChange={field.onChange}
                placeholder={NS.field.locations_placeholder}
                variant="solid"
              />
            )}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{NS.credits.terms}</Label>
          <Input
            {...register("terms")}
            placeholder={NS.field.terms_placeholder}
            className="h-9"
            maxLength={200}
          />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
          <div>
            <Label htmlFor="institute-switch" className="text-sm">
              {NS.field.institute_label}
            </Label>
            <p className="text-muted-foreground text-xs">{NS.field.institute_helper}</p>
          </div>
          <Switch
            id="institute-switch"
            checked={watch("thisProjectOfInstitute")}
            onCheckedChange={(v) =>
              setValue("thisProjectOfInstitute", v, { shouldDirty: true })
            }
          />
        </div>
      </div>
    </section>
  )
}
