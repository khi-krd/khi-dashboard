"use client"

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useFieldArray, useFormContext } from "react-hook-form"

import { NS } from "@/components/about/about-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AboutFormValues } from "@/lib/validations/about"

export function AboutStatsEditorFields() {
  const { control, register } = useFormContext<AboutFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "stats",
  })

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">{NS.form.stats_hint}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={() => append({ labelCkb: "", labelKmr: "", value: "" })}
        >
          <PlusIcon className="size-3.5" />
          {NS.form.stats_add}
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-muted-foreground/70 text-sm">{NS.form.stats_empty}</p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border-border bg-muted/20 grid grid-cols-1 gap-2 rounded-lg border p-3 md:grid-cols-[1fr_1fr_120px_auto]"
            >
              <Input
                placeholder={NS.form.stats_label_ckb}
                {...register(`stats.${index}.labelCkb`)}
              />
              <Input
                placeholder={NS.form.stats_label_kmr}
                {...register(`stats.${index}.labelKmr`)}
              />
              <Input
                placeholder={NS.form.stats_value}
                className="font-mono"
                {...register(`stats.${index}.value`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive size-9 shrink-0"
                onClick={() => remove(index)}
                aria-label={NS.form.stats_remove}
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
