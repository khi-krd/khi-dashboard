"use client"

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useFieldArray, useFormContext } from "react-hook-form"

import { NS } from "@/components/writings/writings-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { WritingFormValues } from "@/lib/validations/writings"

/**
 * People attached to a book — a book can carry several (writer, collector,
 * translator, ...). Name and nickname follow the active language tab like the
 * surrounding fields; role is free text typed by the editor.
 */
export function WritingPersonsSection({ lang }: { lang: "CKB" | "KMR" }) {
  const { control, register } = useFormContext<WritingFormValues>()
  const isKmr = lang === "KMR"
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
          dir={isKmr ? "ltr" : "rtl"}
          className="border-border/70 bg-background/60 grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
        >
          <div>
            <Label className="text-muted-foreground text-[11px]">
              {NS.person.full_name}
            </Label>
            <Input
              className="mt-1 h-9"
              placeholder={
                isKmr ? NS.field.person_name_kmr : NS.field.person_name_ckb
              }
              {...register(
                `persons.${index}.${isKmr ? "nameKmr" : "nameCkb"}`,
              )}
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-[11px]">
              {NS.person.nickname}
            </Label>
            <Input
              className="mt-1 h-9"
              placeholder={
                isKmr
                  ? NS.field.person_nickname_kmr
                  : NS.field.person_nickname_ckb
              }
              {...register(
                `persons.${index}.${isKmr ? "nicknameKmr" : "nicknameCkb"}`,
              )}
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-[11px]">
              {NS.person.role}
            </Label>
            <Input
              className="mt-1 h-9"
              placeholder={NS.field.person_role}
              {...register(`persons.${index}.role`)}
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
            role: "",
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
