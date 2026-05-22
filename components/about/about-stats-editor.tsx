"use client"

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useFieldArray, useFormContext } from "react-hook-form"

import { NS } from "@/components/about/about-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AboutFormValues } from "@/lib/validations/about"
import type { Language } from "@/types/about"

export function AboutStatsEditor({ activeLang }: { activeLang: Language }) {
  const { control, register } = useFormContext<AboutFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "stats",
  })

  return (
    <section className="border-border/60 mt-10 border-t pt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{NS.form.stats}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ labelCkb: "", labelKmr: "", value: "" })
          }
        >
          <PlusIcon className="size-4" />
          {NS.form.stats_add}
        </Button>
      </div>
      {fields.length === 0 ? (
        <p className="text-muted-foreground text-sm">{NS.form.stats_empty}</p>
      ) : (
        <ul className="space-y-3">
          {fields.map((field, index) => (
            <li
              key={field.id}
              className="border-border bg-muted/20 flex flex-wrap items-end gap-3 rounded-lg border p-3"
            >
              <div className="min-w-[120px] flex-1 space-y-1">
                <Label className="text-xs">
                  {activeLang === "CKB"
                    ? NS.form.stats_label_ckb
                    : NS.form.stats_label_kmr}
                </Label>
                <Input
                  {...register(
                    activeLang === "CKB"
                      ? `stats.${index}.labelCkb`
                      : `stats.${index}.labelKmr`,
                  )}
                />
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-xs">{NS.form.stats_value}</Label>
                <Input {...register(`stats.${index}.value`)} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={NS.form.stats_remove}
                onClick={() => remove(index)}
              >
                <TrashIcon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
