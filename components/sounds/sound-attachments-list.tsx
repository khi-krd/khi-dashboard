"use client"

import { PlusIcon } from "@heroicons/react/24/outline"
import { useFieldArray, useFormContext } from "react-hook-form"

import { SoundAttachmentRow } from "@/components/sounds/sound-attachment-row"
import { NS } from "@/components/sounds/sounds-strings"
import { Button } from "@/components/ui/button"
import {
  createEmptyAttachmentRow,
  type SoundFormValues,
} from "@/lib/validations/sounds"

export function SoundAttachmentsList() {
  const { control } = useFormContext<SoundFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "attachments",
  })

  return (
    <section className="mt-12 space-y-4 border-t border-border/60 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium">{NS.section.attachments}</h2>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append(createEmptyAttachmentRow())}
        >
          <PlusIcon className="size-4" />
          {NS.action.new_attachment}
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
          {NS.attachment.empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {fields.map((field, index) => (
            <SoundAttachmentRow
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
