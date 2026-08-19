"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"

import { NM } from "@/components/menu/nav-menu-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import {
  defaultNavMenuLinkValues,
  type NavMenuItemFormValues,
} from "@/lib/validations/nav-menu"
import { NAV_MENU_MAX_VISIBLE_LINKS } from "@/types/nav-menu"

/**
 * Order is positional: `displayOrder` is discarded on the way in and renumbered
 * from the array index on the way out (see `nav-menu-form-data.ts`), so moving a
 * row up or down is the only ordering control the editor needs.
 */
export function NavMenuLinksEditor({ derivedKey }: { derivedKey: boolean }) {
  const { control, register } = useFormContext<NavMenuItemFormValues>()
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "links",
  })

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground before:h-3.5 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">
            {NM.links.title}
          </h3>
          <p className="text-muted-foreground text-xs">
            {fields.length > 0
              ? NM.links.count(formatCkbDigits(fields.length))
              : NM.links.empty}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={() => append(defaultNavMenuLinkValues())}
        >
          <PlusIcon className="size-3.5" />
          {NM.action.addLink}
        </Button>
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">
        {derivedKey ? NM.links.derivedHint : NM.links.ownSourceHint}
      </p>

      {fields.length > NAV_MENU_MAX_VISIBLE_LINKS ? (
        <p className="text-amber-600 dark:text-amber-500 text-xs">
          {NM.links.overflowWarning(
            formatCkbDigits(NAV_MENU_MAX_VISIBLE_LINKS),
          )}
        </p>
      ) : null}

      {fields.length === 0 ? null : (
        <div className="space-y-2">
          {fields.map((field, index) => {
            // Rows past the cap are saved but never rendered by the website.
            const beyondCap = index >= NAV_MENU_MAX_VISIBLE_LINKS
            return (
              <div
                key={field.id}
                className={cn(
                  "border-border bg-muted/20 grid grid-cols-1 gap-2 rounded-lg border p-3",
                  "md:grid-cols-[1fr_1fr_1.2fr_auto]",
                  beyondCap && "opacity-60",
                )}
              >
                <Input
                  placeholder={NM.links.labelCkb}
                  {...register(`links.${index}.labelCkb`)}
                />
                <Input
                  placeholder={NM.links.labelKmr}
                  {...register(`links.${index}.labelKmr`)}
                />
                <Input
                  dir="ltr"
                  placeholder={NM.links.hrefPlaceholder}
                  className="font-mono text-xs"
                  {...register(`links.${index}.href`)}
                />

                <div className="flex shrink-0 items-center gap-1">
                  <Controller
                    name={`links.${index}.active`}
                    control={control}
                    render={({ field: f }) => (
                      <Switch
                        checked={f.value !== false}
                        onCheckedChange={f.onChange}
                        aria-label={NM.field.active}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground size-8 shrink-0"
                    disabled={index === 0}
                    onClick={() => swap(index, index - 1)}
                    aria-label={NM.action.moveUp}
                  >
                    <ArrowUpIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground size-8 shrink-0"
                    disabled={index === fields.length - 1}
                    onClick={() => swap(index, index + 1)}
                    aria-label={NM.action.moveDown}
                  >
                    <ArrowDownIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive size-8 shrink-0"
                    onClick={() => remove(index)}
                    aria-label={NM.action.removeLink}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
