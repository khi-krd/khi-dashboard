"use client"

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"

import { NS } from "@/components/writings/writings-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { WritingFormValues } from "@/lib/validations/writings"
import type { WritingPersonRole } from "@/types/writings"

const ROLE_KEYS: WritingPersonRole[] = [
  "WRITER",
  "COLLECTOR",
  "TRANSLATOR",
  "EDITOR",
  "NARRATOR",
  "PHOTOGRAPHER",
  "OWNER",
  "OTHER",
]

/**
 * People attached to a book — a book can carry several (writer, collector,
 * translator, ...). Name and nickname are entered per script like every other
 * writing field; role is a code, localized at display time.
 */
export function WritingPersonsSection() {
  const { control, register } = useFormContext<WritingFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "persons",
  })

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="text-muted-foreground text-xs italic">
          {NS.person.empty}
        </p>
      ) : null}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="border-border/70 bg-background/60 grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,10rem)_auto] lg:items-end"
        >
          <div>
            <Label className="text-muted-foreground text-[11px]">
              {NS.person.full_name} (سۆرانی)
            </Label>
            <Input
              className="mt-1 h-9"
              placeholder={NS.field.person_name_ckb}
              {...register(`persons.${index}.nameCkb`)}
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-[11px]">
              {NS.person.nickname} (سۆرانی)
            </Label>
            <Input
              className="mt-1 h-9"
              placeholder={NS.field.person_nickname_ckb}
              {...register(`persons.${index}.nicknameCkb`)}
            />
          </div>
          <div dir="ltr">
            <Label className="text-muted-foreground text-[11px]">
              {NS.person.full_name} (کورمانجی)
            </Label>
            <Input
              className="mt-1 h-9"
              placeholder={NS.field.person_name_kmr}
              {...register(`persons.${index}.nameKmr`)}
            />
          </div>
          <div dir="ltr">
            <Label className="text-muted-foreground text-[11px]">
              {NS.person.nickname} (کورمانجی)
            </Label>
            <Input
              className="mt-1 h-9"
              placeholder={NS.field.person_nickname_kmr}
              {...register(`persons.${index}.nicknameKmr`)}
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-[11px]">
              {NS.person.role}
            </Label>
            <Controller
              control={control}
              name={`persons.${index}.role`}
              render={({ field: roleField }) => (
                <Select
                  value={roleField.value ?? "OTHER"}
                  onValueChange={roleField.onChange}
                >
                  <SelectTrigger className="mt-1 h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {ROLE_KEYS.map((role) => (
                      <SelectItem key={role} value={role}>
                        {NS.person.roles[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive size-9 self-end"
            aria-label={NS.person.remove}
            onClick={() => remove(index)}
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() =>
          append({
            role: "WRITER",
            nameCkb: "",
            nameKmr: "",
            nicknameCkb: "",
            nicknameKmr: "",
          })
        }
      >
        <PlusIcon className="size-4" />
        {NS.person.add}
      </Button>
    </div>
  )
}
